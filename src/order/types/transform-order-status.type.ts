import { OrderStatus } from '../enums/order-status.enum';

export type TransformOrderStatus = {
    startStatus: OrderStatus,
    endStatuses: OrderStatus[]
};
