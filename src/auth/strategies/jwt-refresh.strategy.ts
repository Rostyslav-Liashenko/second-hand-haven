import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { JwtToken } from '../types/jwt-token.type';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy,'jwt-refresh') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                req => req.cookies.refreshToken
            ]),
            secretOrKey: process.env.JWT_REFRESH_SECRET,
            passReqToCallback: true
        });
    }

    public validate(req: Request, payload: JwtToken): JwtToken {
        const refreshToken = req.cookies.refreshToken;

        return { ...payload, refreshToken };
    }
}