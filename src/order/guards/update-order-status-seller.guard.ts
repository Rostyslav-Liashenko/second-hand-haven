import { ExecutionContext, Injectable } from '@nestjs/common';
import { UpdateOrderStatusGuard } from './update-order-status.guard';
import { OrderStatus } from '../enums/order-status.enum';
import { allowSellerStatus } from '../constants/allow-order-status.contstants';

@Injectable()
export class UpdateOrderStatusSellerGuard extends UpdateOrderStatusGuard {

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const userId: string = request.user.id;
        const newOrderStatus: OrderStatus = this.findOrderStatusFromRequest(request);
        const order = await this.findOrderFromRequest(request);

        if (!newOrderStatus || !order) return false;

        const isCorrectTransform = this.isCorrectTransform(order, newOrderStatus);
        const isSeller = userId === order.orderProducts[0].product.owner.id;
        const isAllowNewStatus = allowSellerStatus.includes(order.status);

        request.updateOrderDto = { status: newOrderStatus };

        return isCorrectTransform && isSeller && isAllowNewStatus;
    }

}