import { OrderStatus } from '../enums/order-status.enum';


export const allowBuyerStatus = [
    OrderStatus.DELIVERING,
    OrderStatus.NOT_PAYED,
];

export const allowSellerStatus = [
    OrderStatus.CREATED,
    OrderStatus.EXPECT_PAYMENT,
    OrderStatus.CONFIRMED,
];