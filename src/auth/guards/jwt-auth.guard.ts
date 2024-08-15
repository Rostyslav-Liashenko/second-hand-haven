import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_ALLOW_UNAUTHORIZED_KEY } from '../decorators/allow-unauthorized.decorator';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private readonly reflector: Reflector) {
        super();
    }

    public canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const isAnon = this.reflector.getAllAndOverride<boolean>(IS_ALLOW_UNAUTHORIZED_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isAnon) {
            return true;
        }

        return super.canActivate(context);
    }
}