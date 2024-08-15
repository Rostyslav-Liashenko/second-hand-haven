import { ExecutionContext, Injectable } from '@nestjs/common';
import { UpdateOrderStatusGuard } from './update-order-status.guard';
import { allowBuyerStatus } from '../constants/allow-order-status.contstants';

@Injectable()
export class UpdateOrderStatusBuyerGuard extends UpdateOrderStatusGuard {

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const userId: string = request.user.id;
        const newOrderStatus = this.findOrderStatusFromRequest(request);
        const order = await this.findOrderFromRequest(request);

        if (!newOrderStatus || !order) return false;

        const isCorrectTransform = this.isCorrectTransform(order, newOrderStatus);
        const isBuyer = userId === order.buyer.id;
        const isAllowNewStatus = allowBuyerStatus.includes(order.status);

        request.updateOrderDto = { status: newOrderStatus };

        return isCorrectTransform && isBuyer && isAllowNewStatus;
    }
}