import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserPayload } from '../types/user.payload.type';
import { UserResponseDto } from '../../user/dtos/response/user.response.dto';
import * as process from 'node:process';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_ACCESS_SECRET
        });
    }

    public async validate(payload: UserPayload): Promise<UserResponseDto> {
        return {
            id: payload.sub,
            firstName: payload.firstName,
            lastName: payload.lastName,
            imageUrl: payload.imageUrl,
            systemRole: payload.systemRole,
            publicProfileId: payload.publicProfileId,
            isEmailConfirm: payload.isEmailConfirm,
        };
    }
}