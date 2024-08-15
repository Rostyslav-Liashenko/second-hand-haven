import { Injectable } from '@nestjs/common';
import { UserService } from '../../user/services/user.service';
import { User } from '../../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { JwtToken } from '../types/jwt-token.type';
import { BaseService } from '../../core/services/base.service';
import { UnitOfWorkService } from '../../core/services/unit-of-work.service';
import { UserResponseDto } from '../../user/dtos/response/user.response.dto';
import { EmailConfirmService } from './email-confirm.service';
import { LocalRegistrationRequestDto } from '../dtos/request/local-registration.request.dto';
import { EmailConfirmRequestDto } from '../dtos/request/email-confirm.request.dto';
import { HashService } from './hash.service';
import { EmailExistResponseDto } from '../dtos/response/email-exist.response.dto';
import * as process from 'node:process';
import { NotMatchException } from '../../core/exceptions/not-match.exception';
import { InvalidCredentialsException } from '../../core/exceptions/invalid-credentials.exception';
import { UserPayload } from '../types/user.payload.type';
import { LocalRegistrationWithoutTokenRequestDto } from '../dtos/request/local-registration-without-token.request.dto';
import { TryResetPasswordRequestDto } from '../dtos/request/try-reset-password.request.dto';
import { NotFoundException } from '../../core/exceptions/not-found.exception';
import { ConfirmEmailPayload } from '../types/confirm-email-payload.type';
import { ConfirmEmail } from '../../views/types/email-confirm.type';
import { EmailService } from '../../core/services/email.service';
import { ResetPasswordRequestDto } from '../dtos/request/reset-password.request.dto';
import { InvalidJwtTokenException } from '../../core/exceptions/invalid-jwt-token.exception';
import { CustomLoggerService } from '../../core/logger/custom-logger.service';
import { PersonalSettingService } from '../../user/services/personal-setting.service';
import { UpdatePasswordRequestDto } from '../../user/dtos/request/update-password.request.dto';
import { UpdateShippingInfoRequestDto } from '../../shipping-info/dtos/request/update-shipping-info.request.dto';
import {
    UpsertCardRequestDto
} from '../../card/dtos/request/upsert-card.request.dto';
import { ShippingInfoService } from '../../shipping-info/services/shipping-info.service';
import { CardService } from '../../card/services/card.service';
import { AdminRegistrationRequestDto } from '../dtos/request/admin-registration.request.dto';

@Injectable()
export class AuthService extends BaseService {
    constructor(
        protected readonly unitOfWork: UnitOfWorkService,
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly emailConfirmService: EmailConfirmService,
        private readonly emailService: EmailService,
        private readonly cryptoService: HashService,
        private readonly customLoggerService: CustomLoggerService,
        private readonly personalSettingService: PersonalSettingService,
        private readonly shippingInfoService: ShippingInfoService,
        private readonly cardService: CardService,
    ) {
        super(unitOfWork);
        this.customLoggerService.setContext(AuthService.name);
    }

    public async adminRegister(adminRegister: AdminRegistrationRequestDto): Promise<UserResponseDto> {
        const emailExist = await this.emailExist(adminRegister.email.toLowerCase());

        if (!emailExist.isAvailability) {
            throw new InvalidCredentialsException();
        }

        adminRegister.email = adminRegister.email.toLowerCase();
        adminRegister.password = await this.cryptoService.hashing(adminRegister.password);

        return await this.userService.createByLocalAuth(adminRegister);
    }

    public async register(userCreateRequest: LocalRegistrationWithoutTokenRequestDto): Promise<UserResponseDto> {
        const work = async () => {
            const emailExist = await this.emailExist(userCreateRequest.email.toLowerCase());

            if (!emailExist.isAvailability) {
                throw new InvalidCredentialsException();
            }

            userCreateRequest.email = userCreateRequest.email.toLowerCase();
            userCreateRequest.password = await this.cryptoService.hashing(userCreateRequest.password);

            const user = await this.userService.createByRegistrationAuth(userCreateRequest);

            const updateShippingInfo: UpdateShippingInfoRequestDto = {
                addressLine: userCreateRequest.addressLine,
                city: userCreateRequest.city,
                zipCode: userCreateRequest.zipCode
            };

            const updateCard: UpsertCardRequestDto = {
                number: userCreateRequest.number,
                cvv: userCreateRequest.cvv,
                expireMonth: userCreateRequest.expireMonth,
                expireYear: userCreateRequest.expireYear,
            };


            await this.shippingInfoService.updateByUserId(user.id, updateShippingInfo);
            await this.cardService.updateByUserId(user.id, updateCard);

            return user;
        };

        return this.unitOfWork.doWork(work);
    }

    public async login(user: User): Promise<JwtToken> {
        const token = await this.generateJwtToken(user);
        await this.updateRefreshToken(user.id, token.refreshToken);

        return token;
    }

    public async logout(userId: string): Promise<void> {
        await this.userService.updateRefreshToken(userId, null);
    }

    public async refreshTokens(userId: string, refreshToken: string): Promise<JwtToken> {
        const user = await this.unitOfWork.userRepository.findById(userId);

        if (!user) {
            throw new NotMatchException();
        }

        const refreshTokenMatches = await this.cryptoService.isCompare(
            refreshToken,
            user.auth.refreshToken,
        );

        if (!refreshTokenMatches) {
            throw new NotMatchException();
        }

        return await this.login(user);
    }

    public async emailConfirm(confirmEmailRequest: EmailConfirmRequestDto): Promise<UserResponseDto> {
        const email = await this.emailConfirmService.decryptConfirmToken(confirmEmailRequest.token);

        return await this.userService.markEmailAsConfirmed(email);
    }

    public async userExistByLocalAuth(email: string, password: string): Promise<User | null> {
        const user = await this.unitOfWork.userRepository.findByEmailLocalAuth(email.toLowerCase());

        if (user) {
            const isPasswordMatching = await this.cryptoService.isCompare(password, user.auth.localAuth.password);

            if (isPasswordMatching) {
                return user;
            }
        }

        return null;
    }

    public async emailExist(email: string): Promise<EmailExistResponseDto> {
        const user = await this.unitOfWork.userRepository.findByEmail(email.toLowerCase());

        return {
            isAvailability: !Boolean(user),
        };
    }

    public async tryResetPassword(tryResetPasswordRequestDto: TryResetPasswordRequestDto): Promise<void> {
        const { email } = tryResetPasswordRequestDto;
        const foundedUser = await this.unitOfWork.userRepository.findByEmail(email);

        if (!foundedUser) {
            throw new NotFoundException();
        }

        const payload: ConfirmEmailPayload = { email };

        const token = this.jwtService.sign(payload, {
            secret: process.env.JWT_VERIFICATION_TOKEN_SECRET,
            expiresIn: `${process.env.JWT_VERIFICATION_TOKEN_EXPIRATION_TIME}s`
        });

        const emailWithLink: ConfirmEmail = {
            link: `${process.env.SITE_URL}/${process.env.RESET_PASSWORD_URL}?token=${token}`
        };

        await this.updateResetPasswordToken(foundedUser.id, token);

        return this.emailService.sendResetPassword(email, emailWithLink);
    }

    public async resetPassword(resetPasswordRequestDto: ResetPasswordRequestDto): Promise<void> {
        const { resetPasswordToken, password } = resetPasswordRequestDto;
        const email = await this.decryptResetPasswordToken(resetPasswordToken);
        const foundedUser = await this.unitOfWork.userRepository.findByEmail(email);

        if (!foundedUser) {
            throw new NotFoundException();
        }

        if (!foundedUser.auth.resetPasswordToken) {
            throw new InvalidJwtTokenException();
        }

        const isSameResetPasswordToken = await this.cryptoService.isCompare(
            resetPasswordToken,
            foundedUser.auth.resetPasswordToken
        );

        if (!isSameResetPasswordToken) {
            throw new InvalidJwtTokenException();
        }

        const updatePasswordRequestDto: UpdatePasswordRequestDto = { password };

        await this.personalSettingService.updatePassword(foundedUser.id, updatePasswordRequestDto);

        foundedUser.auth.resetPasswordToken = null;
        foundedUser.auth.refreshToken = null;
        await this.unitOfWork.userRepository.save(foundedUser);
    }

    private async generateJwtToken(user: User): Promise<JwtToken> {
        const payload: UserPayload = {
            sub: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            imageUrl: User.toImageResponseDto(user.imageUrl),
            publicProfileId: user.publicProfileId,
            systemRole: user.systemRole,
            isEmailConfirm: user.isEmailConfirm,
        };

        const accessToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: `${process.env.JWT_ACCESS_EXPIRE_TIME}s`,
        });

        const refreshToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: `${process.env.JWT_REFRESH_EXPIRE_TIME}s`,
        });

        return {
            accessToken,
            refreshToken,
        };
    }

    private async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
        const hashedRefreshToken = await this.cryptoService.hashing(refreshToken);
        await this.userService.updateRefreshToken(userId, hashedRefreshToken);
    }

    private async updateResetPasswordToken(userId: string, resetPasswordToken: string): Promise<void> {
        const hashedResetToken = await this.cryptoService.hashing(resetPasswordToken);
        await this.userService.updateResetPasswordToken(userId, hashedResetToken);
    }

    private async decryptResetPasswordToken(resetPasswordToken: string): Promise<string> {
        try {
            const payload = await this.jwtService.verify(resetPasswordToken, {
                secret: process.env.JWT_VERIFICATION_TOKEN_SECRET,
            });

            return payload.email;
        } catch (error) {
            this.customLoggerService.error(error);
            throw new InvalidJwtTokenException();
        }
    }
}