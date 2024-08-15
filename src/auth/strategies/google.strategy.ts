import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { UserService } from '../../user/services/user.service';
import * as process from 'node:process';
import { SocialLoginRequestDto } from '../dtos/request/social-login.request.dto';
import { User } from '../../user/entities/user.entity';
import { UserResponseDto } from '../../user/dtos/response/user.response.dto';
import { DuplicateLoginEmailException } from '../../core/exceptions/duplicate-login-email.exception';
import { AuthService } from '../services/auth.service';

type GoogleEmail = { value: string, verified: boolean };
type GooglePhoto = { value: string };

type GoogleProfile = {
    id: string;
    displayName: string;
    name: { givenName: string; familyName: string };
    emails: GoogleEmail[];
    photos: GooglePhoto[];
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        private readonly userService: UserService,
        private readonly authService: AuthService,
    ) {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_SECRET,
            callbackURL: `${process.env.SERVER_URL}/api/auth/google/callback`,
            scope: ['profile', 'email'],
        });
    }

    public async validate(
        accessToken: string,
        refreshToken: string,
        profile: GoogleProfile,
        done: VerifyCallback,
    ): Promise<void> {
        const userCreateGoogle: SocialLoginRequestDto = {
            socialId: profile.id,
            email: profile.emails[0].value.toLowerCase(),
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            imageUrl: profile.photos[0].value,
            isConfirm: true,
            isEmailSubscribe: true,
            isAccordingTermUse: true,
            isEmailConfirm: true,
        };

        const user = this.findUserOrCreate(userCreateGoogle);

        return done(null, user);
    }

    private async findUserOrCreate(userCreateGoogle: SocialLoginRequestDto): Promise<User | UserResponseDto> {
        const foundedUser = await this.userService.getByGoogleSocialId(userCreateGoogle.socialId);

        return Boolean(foundedUser)
            ? foundedUser
            : await this.createByGoogleAuth(userCreateGoogle);
    }

    private async createByGoogleAuth(userCreateGoogle: SocialLoginRequestDto): Promise<UserResponseDto> {
        const isExistEmail = await this.authService.emailExist(userCreateGoogle.email);

        if (!isExistEmail.isAvailability) {
            throw new DuplicateLoginEmailException();
        }

        return this.userService.createByGoogleAuth(userCreateGoogle);
    }
}