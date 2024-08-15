import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { JwtToken } from '../types/jwt-token.type';
import { JwtTokenResponseDto } from '../dtos/response/jwt-token.response.dto';
import { Reflector } from '@nestjs/core';
import { IS_SOCIAL_AUTH } from '../decorators/social-auth.decorator';
import * as process from 'node:process';

@Injectable()
export class AuthInterceptor implements NestInterceptor {

    constructor(private readonly reflector: Reflector) {}

    public intercept(
        context: ExecutionContext,
        next: CallHandler<any>
    ): Observable<JwtTokenResponseDto> {
        return next
            .handle()
            .pipe(
                map((jwtToken: JwtToken) => {
                    const response = context.switchToHttp().getResponse();
                    const isSocialAuth = this.reflector.get<boolean>(IS_SOCIAL_AUTH, context.getHandler());
                    const jwtTokenResponseDto = { accessToken: jwtToken.accessToken };
                    const redirectUrl = `${process.env.SITE_URL}/${process.env.SOCIAL_AUTH_SUCCESS_REDIRECT}?token=${jwtTokenResponseDto.accessToken}`;
                    const multipleSecondToMilliSeconds = 1000;
                    const maxAge = Number.parseInt(process.env.JWT_REFRESH_EXPIRE_TIME) * multipleSecondToMilliSeconds;

                    response.cookie('refreshToken', jwtToken.refreshToken, {
                        httpOnly: true,
                        maxAge: `${maxAge}`
                    });

                    if (isSocialAuth) {
                        response.redirect(redirectUrl);
                    } else {
                        return jwtTokenResponseDto;
                    }
                }),
            );
    }
}