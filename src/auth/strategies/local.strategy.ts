import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../services/auth.service';
import { User } from '../../user/entities/user.entity';
import { NotFoundException } from '../../core/exceptions/not-found.exception';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true,
        });
    }

    public async validate(req: Request, email: string, password: string): Promise<User> {
        const user = await this.authService.userExistByLocalAuth(email.toLowerCase(), password);

        if (!user) {
            throw new NotFoundException();
        }

        return user;
    }
}