import { OrderStatus } from '../../enums/order-status.enum';
import { IsEnum, IsNotEmpty } from 'class-validator';


export class UpdateOrderRequestDto {
    @IsNotEmpty()
    @IsEnum(OrderStatus)
    public status: OrderStatus;
}