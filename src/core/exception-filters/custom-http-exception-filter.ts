import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { BaseException } from '../exceptions/base.exception';
import * as process from 'node:process';
import { DuplicateLoginEmailException } from '../exceptions/duplicate-login-email.exception';

@Catch()
export class CustomHttpExceptionFilter implements ExceptionFilter {
    constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

    public catch(exception: BaseException, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = host.switchToHttp().getResponse();

        const { httpAdapter } = this.httpAdapterHost;

        const responseBody = {
            statusCode: exception.status,
            message: exception.message,
            timeStamp: new Date().toISOString(),
        }

        if (exception instanceof DuplicateLoginEmailException) {
            response.redirect(`${process.env.SITE_URL}/${process.env.SOCIAL_AUTH_FAIL_REDIRECT}`);
        } else {
            httpAdapter.reply(ctx.getResponse(), responseBody, exception.status);
        }
    }
}
