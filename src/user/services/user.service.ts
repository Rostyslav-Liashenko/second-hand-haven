import { Injectable } from '@nestjs/common';
import { BaseService } from '../../core/services/base.service';
import { UnitOfWorkService } from '../../core/services/unit-of-work.service';
import { UserResponseDto } from '../dtos/response/user.response.dto';
import { User } from '../entities/user.entity';
import { SocialLoginRequestDto } from '../../auth/dtos/request/social-login.request.dto';
import { UpdateUserRequestDto } from '../dtos/request/update-user.request.dto';
import { NotFoundException } from '../../core/exceptions/not-found.exception';
import { PublicProfileResponseDto } from '../dtos/response/public-profile.response.dto';
import { PageOptionsRequestDto } from '../../core/dto/request/page-options.request.dto';
import { PageResponseDto } from '../../core/dto/response/page.response.dto';
import { PaginationService } from '../../core/services/pagination.service';
import { DetailUserResponseDto } from '../dtos/response/detail-user.response.dto';
import { AdminRegistrationRequestDto } from '../../auth/dtos/request/admin-registration.request.dto';
import { ProductService } from '../../product/services/product.service';
import {
    LocalRegistrationWithoutTokenRequestDto
} from '../../auth/dtos/request/local-registration-without-token.request.dto';

@Injectable()
export class UserService extends BaseService {
    constructor(
        protected readonly unitOfWork: UnitOfWorkService,
        private readonly paginationService: PaginationService,
        private readonly productService: ProductService,
    ) {
        super(unitOfWork);
    }

    public async findAll(pageOptionsDto: PageOptionsRequestDto): Promise<PageResponseDto<DetailUserResponseDto>> {
        const userSelectQueryBuilder = await this.unitOfWork.userRepository.findAllQueryBuilder(pageOptionsDto);

        const { entities } = await userSelectQueryBuilder.getRawAndEntities();
        const totalItemCount = await userSelectQueryBuilder.getCount();
        const detailUserResponseDtos = entities.map((entity) => User.toDetailUser(entity));

        return this.paginationService.createPage(detailUserResponseDtos, pageOptionsDto, totalItemCount);
    }

    public async findById(id: string): Promise<DetailUserResponseDto> {
        const user = await this.unitOfWork.userRepository.findById(id);

        return User.toDetailUser(user);
    }

    public async findOwners(): Promise<UserResponseDto[]> {
        const owners = await this.unitOfWork.userRepository.findAll();

        return owners.map((owner) => User.toDto(owner));
    }

    public async findTopSellers(countSeller: number): Promise<UserResponseDto[]> {
        const topSellers = await this.unitOfWork.userRepository.findSellersByProductCount(countSeller);

        return topSellers.map((topSeller) => User.toDto(topSeller));
    }

    public async findByPublicProfileId(publicProfileId: string): Promise<PublicProfileResponseDto> {
        const user = await this.unitOfWork.userRepository.findByPublicProfileId(publicProfileId);

        if (!user) {
            throw new NotFoundException();
        }

        return User.toPublicProfileDto(user);
    }

    public async createByLocalAuth(localRegistrationRequestDto: AdminRegistrationRequestDto): Promise<UserResponseDto> {
        const work = async () => {
            const userFromDto = User.fromLocalAuthDto(localRegistrationRequestDto);
            const publicProfileId = await this.generatePublicProfileId(userFromDto.firstName, userFromDto.lastName );
            const userPublicProfile = { ...userFromDto, publicProfileId  };

            const user = await this.unitOfWork.userRepository.save(userPublicProfile);

            await this.generateStandardEntities(user.id);

            return User.toDto(user);
        }

        return await this.unitOfWork.doWork(work);
    }

    public async createByRegistrationAuth(userCreate: LocalRegistrationWithoutTokenRequestDto): Promise<UserResponseDto> {
        const work = async () => {
            const userFromDto = User.fromLocalAuthDto(userCreate);
            const publicProfileId = await this.generatePublicProfileId(userFromDto.firstName, userFromDto.lastName );

            userFromDto.firstName = userCreate.firstName;
            userFromDto.lastName = userCreate.lastName;
            userFromDto.phoneNumber = userCreate.phoneNumber;
            userFromDto.aboutMe = '';

            const userPublicProfile = { ...userFromDto, publicProfileId  };

            const user = await this.unitOfWork.userRepository.save(userPublicProfile);

            await this.generateStandardEntities(user.id);

            return User.toDto(user);
        };

        return await this.unitOfWork.doWork(work);
    }

    public async createByGoogleAuth(socialLoginRequestDto: SocialLoginRequestDto): Promise<UserResponseDto> {
        const work = async () => {
            const userFromDto = User.fromGoogleAuthDto(socialLoginRequestDto);
            const publicProfileId = await this.generatePublicProfileId(userFromDto.firstName, userFromDto.lastName );
            const userPublicProfile = { ...userFromDto, publicProfileId  };

            const user = await this.unitOfWork.userRepository.save(userPublicProfile);

            await this.generateStandardEntities(user.id);

            return User.toDto(user);
        }

        return await this.unitOfWork.doWork(work);
    }

    public async createByFacebookAuth(socialLoginRequestDto: SocialLoginRequestDto): Promise<UserResponseDto> {
        const work = async () => {
            const userFromDto = User.fromFacebookAuthDto(socialLoginRequestDto);
            const publicProfileId = await this.generatePublicProfileId(userFromDto.firstName, userFromDto.lastName );
            const userPublicProfile = { ...userFromDto, publicProfileId  };

            const user = await this.unitOfWork.userRepository.save(userPublicProfile);

            await this.generateStandardEntities(user.id);

            return User.toDto(user);
        }

        return await this.unitOfWork.doWork(work);
    }

    public async getByGoogleSocialId(socialId: string): Promise<User> | null {
        const user = await this.unitOfWork.userRepository.findByGoogleSocialId(socialId);

        return Boolean(user) ? user : null;
    }

    public async getByFacebookSocialId(socialId: string): Promise<User> | null {
        const user = await this.unitOfWork.userRepository.findByFacebookSocialId(socialId);

        return Boolean(user) ? user: null;
    }

    public async updateRefreshToken(userId: string, refreshToken: string): Promise<User> {
        const work = async () => {
            const user = await this.unitOfWork.userRepository.findById(userId);

            if (!user) {
                throw new NotFoundException();
            }

            user.auth.refreshToken = refreshToken;

            return await this.unitOfWork.userRepository.save(user);
        }

        return await this.unitOfWork.doWork(work);
    }

    public async updateResetPasswordToken(userId: string, resetToken: string): Promise<User> {
        const work = async() => {
            const user = await this.unitOfWork.userRepository.findById(userId);

            if (!user) {
                throw new NotFoundException();
            }

            user.auth.resetPasswordToken = resetToken;

            return await this.unitOfWork.userRepository.save(user);
        }

        return await this.unitOfWork.doWork(work);
    }

    public async markEmailAsConfirmed(email: string): Promise<UserResponseDto> {
        const work = async () => {
            const userFromRepository = await this.unitOfWork.userRepository.findByEmailLocalAuth(email);

            if (!userFromRepository) {
                throw new NotFoundException();
            }

            userFromRepository.isEmailConfirm = true;
            const user = await this.unitOfWork.userRepository.save(userFromRepository);

            return User.toDto(user);
        }

        return this.unitOfWork.doWork(work);
    }

    public async update(id: string, updateUserRequestDto: UpdateUserRequestDto): Promise<UserResponseDto> {
        const work = async () => {
            const userFromDto = User.fromUpdateUserDto(updateUserRequestDto);
            const userToUpdate = await this.unitOfWork.userRepository.findById(id);

            if (!userToUpdate) {
                throw new NotFoundException();
            }

            userToUpdate.firstName = userFromDto.firstName;
            userToUpdate.lastName = userFromDto.lastName;
            userToUpdate.isEmailConfirm = userFromDto.isEmailConfirm;
            userToUpdate.phoneNumber = userFromDto.phoneNumber;
            userToUpdate.systemRole = userFromDto.systemRole;

            const user = await this.unitOfWork.userRepository.save(userToUpdate);

            return User.toDto(user);
        }

        return await this.unitOfWork.doWork(work);
    }

    public async findUserByPhoneNumber(phoneNumber: string): Promise<UserResponseDto | null> {
        const user = await this.unitOfWork.userRepository.findByPhoneNumber(phoneNumber);

        return user ? User.toDto(user) : null;
    }

    public async isExistUserByPhoneNumber(phoneNumber: string): Promise<boolean> {
        const user = await this.findUserByPhoneNumber(phoneNumber);

        return Boolean(user);
    }

    public async generatePublicProfileId(firstName?: string, lastName?: string): Promise<string> {
        const publicIdSuffixMax = 9999;
        const lengthPublicIdSuffix = 4;
        const fullName = `${firstName ?? ''}${lastName ?? ''}`;

        let publicProfileId = '';

        do {
            const randomNumber = Math.random() * publicIdSuffixMax;
            const publicIdSuffix = Math.round(randomNumber).toString();
            const formattedPublicIdSuffix = publicIdSuffix.padStart(lengthPublicIdSuffix, '0');
            publicProfileId = fullName + formattedPublicIdSuffix;

            const userWithPublicId = await this.unitOfWork.userRepository.findByPublicProfileId(publicProfileId);
            const isUserExists = Boolean(userWithPublicId);

            if (!isUserExists) break;
        } while (true);

        return publicProfileId;
    }

    public async softDeleteById(id: string): Promise<void> {
        const work = async () => {
            const user = await this.unitOfWork.userRepository.findByIdWithProduct(id);

            if (!user) {
                throw new NotFoundException();
            }

            const productIds = user.products.map((product) => product.id);

            if (productIds.length > 0) {
                await this.productService.deleteByIds(productIds);
            }

            await this.unitOfWork.cartRepository.softDeleteByUserId(id);
            await this.unitOfWork.wishlistRepository.softDeleteByUserId(id);
            await this.unitOfWork.shippingInfoRepository.softDeleteByUserId(id);
            await this.unitOfWork.cardRepository.softDeleteByUserId(id);
            await this.unitOfWork.userRepository.softRemove(user);
        }

        return this.unitOfWork.doWork(work);
    }

    private async generateStandardEntities(userId: string): Promise<void> {
        await this.unitOfWork.wishlistRepository.generateWishlist(userId);
        await this.unitOfWork.cartRepository.generateCart(userId);
        await this.unitOfWork.shippingInfoRepository.generateShippingInfo(userId);
        await this.unitOfWork.cardRepository.generateCard(userId);
    }
}
