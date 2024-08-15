import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { User } from '../../user/entities/user.entity';
import { OrderResponseDto } from '../dtos/response/order.response.dto';
import { OrderProduct } from './order-product.entity';
import { CreateOrderRequestDto } from '../dtos/request/create-order.request.dto';

@Entity({name: 'order'})
export class Order extends BaseEntity {
    @Column({
        name: 'status',
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.CREATED
    })
    public status: OrderStatus;

    @Column({name: 'receiver_first_name', type: 'varchar', length: 100})
    public receiverFirstName;

    @Column({name: 'receiver_last_name', type: 'varchar', length: 100})
    public receiverLastName;

    @Column({name: 'phone_number', type: 'varchar', length: 10})
    public phoneNumber;

    @Column({name: 'address_line', type: 'varchar', length: 200})
    public addressLine: string;

    @Column({name: 'city', type: 'varchar', length: 500})
    public city: string;

    @Column({name: 'zip_code', type: 'varchar', length: 10})
    public zipCode: string;

    @Column({name: 'track_id', type: 'varchar', length: 50, nullable: true})
    public trackId?: string;

    @ManyToOne(() => User, (user) => user.orders)
    @JoinColumn({name: 'buyer_id'})
    public buyer: User;

    @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.order, { cascade: true })
    public orderProducts: OrderProduct[];

    public static toDto(order: Order, sum = 0): OrderResponseDto {
        return {
            id: order.id,
            buyer: User.toDto(order.buyer),
            createdAt: order.createdAt,
            status: order.status,
            orderProducts: (order.orderProducts || []).map((orderProduct) => OrderProduct.toDto(orderProduct)),
            sum,
            receiverFirstName: order.receiverFirstName,
            receiverLastName: order.receiverLastName,
            addressLine: order.addressLine,
            city: order.city,
            zipCode: order.zipCode,
            trackId: order.trackId,
        }
    }

    public static fromCreateOrderDto(dto: CreateOrderRequestDto): Order {
        const order = new Order();

        order.buyer = { id: dto.buyerId } as User;
        order.status = OrderStatus.CREATED;
        order.receiverFirstName = dto.receiverFirstName;
        order.receiverLastName = dto.receiverLastName;
        order.phoneNumber = dto.phoneNumber;
        order.addressLine = dto.addressLine;
        order.city = dto.city;
        order.zipCode = dto.zipCode;

        return order;
    }
}
