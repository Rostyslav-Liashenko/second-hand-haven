import { UserResponseDto } from '../../../user/dtos/response/user.response.dto';
import { OrderStatus } from '../../enums/order-status.enum';
import { OrderProductResponseDto } from './order-product.response.dto';

export class OrderResponseDto {
    public id: string;
    public buyer: UserResponseDto;
    public status: OrderStatus;
    public createdAt: Date;
    public sum: number;
    public orderProducts: OrderProductResponseDto[]
    public receiverFirstName: string;
    public receiverLastName: string;
    public addressLine: string;
    public city: string;
    public zipCode: string;
    public trackId?: string;
}
