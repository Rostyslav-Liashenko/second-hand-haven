import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { TransformOrderStatus } from '../types/transform-order-status.type';
import { OrderService } from '../services/order.service';
import { OrderStatus } from '../enums/order-status.enum';
import { Order } from '../entities/order.entity';
import { Request } from 'express';

@Injectable()
export class UpdateOrderStatusGuard implements CanActivate {
    private readonly allowStatuses: TransformOrderStatus[];

    constructor(
        protected readonly orderService: OrderService
    ) {
        this.allowStatuses = [
            { startStatus: OrderStatus.CREATED, endStatuses: [ OrderStatus.EXPECT_PAYMENT, OrderStatus.CANCEL ]},
            { startStatus: OrderStatus.NOT_PAYED, endStatuses: [ OrderStatus.EXPECT_PAYMENT, OrderStatus.CANCEL ] },
            { startStatus: OrderStatus.CONFIRMED, endStatuses: [ OrderStatus.DELIVERING, OrderStatus.CANCEL ] },
            { startStatus: OrderStatus.DELIVERING, endStatuses: [ OrderStatus.CLOSED, OrderStatus.RETURNED ] },
        ];
    }

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const newOrderStatus = this.findOrderStatusFromRequest(request);
        const order = await this.findOrderFromRequest(request);

        if (!newOrderStatus || !order) return false;

        return this.isCorrectTransform(order, newOrderStatus);
    }

    protected isCorrectTransform(order: Order, newOrderStatus: OrderStatus): boolean {
        const foundAllowStatus = this.allowStatuses.find(
            (allowStatus) => allowStatus.startStatus === order.status
        );

        const foundEndStatuses = foundAllowStatus.endStatuses;

        return foundEndStatuses.includes(newOrderStatus);
    }

    protected async findOrderFromRequest(request: Request): Promise<Order> | undefined {
        const orderId: string = request.params.id;

        return await this.orderService.findEntityById(orderId);
    }

    protected findOrderStatusFromRequest(request: Request): OrderStatus {
        return request.body.status as OrderStatus;
    }
}