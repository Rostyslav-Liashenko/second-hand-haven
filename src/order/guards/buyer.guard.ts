import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';


@Injectable()
export class BuyerGuard implements CanActivate {
    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const userId: string = request.user.id;
        const buyerId: string = request.body.buyerId;

        return userId === buyerId;
    }
}
