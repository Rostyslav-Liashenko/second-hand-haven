import { Injectable } from '@nestjs/common';
import { BaseService } from '../../core/services/base.service';
import { UnitOfWorkService } from '../../core/services/unit-of-work.service';
import { JwtService } from '@nestjs/jwt';
import { ConfirmEmailPayload } from '../types/confirm-email-payload.type';
import * as process from 'node:process';
import { CustomLoggerService } from '../../core/logger/custom-logger.service';
import { InvalidJwtTokenException } from '../../core/exceptions/invalid-jwt-token.exception';
import { ConfirmEmail } from '../../views/types/email-confirm.type';
import { NotMatchException } from '../../core/exceptions/not-match.exception';
import { InvalidCredentialsException } from '../../core/exceptions/invalid-credentials.exception';
import { EmailService } from '../../core/services/email.service';

@Injectable()
export class EmailConfirmService extends BaseService {
    constructor(
        protected readonly unitOfWork: UnitOfWorkService,
        private readonly jwtService: JwtService,
        private readonly emailService: EmailService,
        private readonly customLoggerService: CustomLoggerService,
    ) {
        super(unitOfWork);
        customLoggerService.setContext(EmailConfirmService.name);
    }

    public async sendVerificationLinkByUserId(userId: string): Promise<void> {
        const user = await this.unitOfWork.userRepository.findById(userId);

        if (!user) {
            throw new NotMatchException();
        }

        if (user.isEmailConfirm) {
            throw new InvalidCredentialsException();
        }

        const emailToConfirm = user.auth.email.toLowerCase();
        void this.sendVerificationLink(emailToConfirm);
    }

    public async sendVerificationLink(email: string): Promise<void> {
        const payload: ConfirmEmailPayload = { email: email.toLowerCase() };

        const token = this.jwtService.sign(payload, {
            secret: process.env.JWT_VERIFICATION_TOKEN_SECRET,
            expiresIn: `${process.env.JWT_VERIFICATION_TOKEN_EXPIRATION_TIME}s`
        });

        const confirmEmail: ConfirmEmail = {
            link: `${process.env.SITE_URL}/${process.env.EMAIL_CONFIRMATION_URL}/${token}`,
        }

        return this.emailService.sendConfirmEmail(email, confirmEmail);
    }


    public async decryptConfirmToken(token: string): Promise<string> {
        try {
            const payload = await this.jwtService.verify(token, {
                secret: process.env.JWT_VERIFICATION_TOKEN_SECRET,
            });

            return payload.email;
        } catch (error) {
            this.customLoggerService.error(error);
            throw new InvalidJwtTokenException();
        }
    }
}