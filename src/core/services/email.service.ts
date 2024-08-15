import { Injectable } from '@nestjs/common';
import { BaseService } from './base.service';
import { UnitOfWorkService } from './unit-of-work.service';
import { MailerService } from '@nestjs-modules/mailer';
import * as process from 'node:process';
import { CustomLoggerService } from '../logger/custom-logger.service';
import { ConfirmEmail } from '../../views/types/email-confirm.type';
import { NotEnoughMoney } from '../../views/types/not-enough-money.type';

@Injectable()
export class EmailService extends BaseService {
    constructor(
        protected readonly unitOfWork: UnitOfWorkService,
        private readonly customLoggerService: CustomLoggerService,
        private readonly mailerService: MailerService,
    ) {
        super(unitOfWork);
        this.customLoggerService.setContext('EmailService');
    }

    public async sendConfirmEmail(to: string, options: ConfirmEmail): Promise<void> {
        const subject = 'Email confirmation';

        await this.send(to, subject, 'email-confirm', options);
    }

    public async sendResetPassword(to: string, options: ConfirmEmail): Promise<void> {
        const subject = 'Reset password';

        await this.send(to, subject, 'forgot-password', options);
    }

    public async sendNotEnoughMoneyInLandsbankinn(to: string, options: NotEnoughMoney): Promise<void> {
        const subject = 'Not enough money';

        await this.send(to, subject, 'not-enough-money', options);
    }

    private async send(
        to: string, subject: string, template: string,
        options: ConfirmEmail | NotEnoughMoney
    ): Promise<void> {
        try {
            await this.mailerService.sendMail({
                from: process.env.EMAIL_FROM,
                to: to,
                subject: `[BGreen] ${subject}`,
                template: template,
                context: {
                    sender: options
                }
            });
        } catch (error) {
            this.customLoggerService.error(error);
        }
    }
}