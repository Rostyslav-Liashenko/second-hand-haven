import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';


@Injectable()
export class EmailConfirmGuard implements CanActivate {

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            return false;
        }

        return user.isEmailConfirm;
    }
}
