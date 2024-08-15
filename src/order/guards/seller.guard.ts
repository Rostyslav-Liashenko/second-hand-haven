import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { OrderService } from '../services/order.service';


@Injectable()
export class SellerGuard implements CanActivate {

    constructor(private readonly orderService: OrderService) {}

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const orderId = request.params.id;
        const order = await this.orderService.findById(orderId);
        const seller = order.orderProducts[0].product.owner;

        const userId: string = request.user.id;

        return seller.id === userId;
    }
}