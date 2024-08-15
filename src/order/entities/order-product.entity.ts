import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { Product } from '../../product/entities/product.entity';
import { Order } from './order.entity';
import { OrderProductResponseDto } from '../dtos/response/order-product.response.dto';
import { PriceOfferStatus } from '../../price-offer/enums/price-offer-status.enum';

@Entity({name: 'order_product'})
export class OrderProduct extends BaseEntity {
    @Column({name: 'price', type: 'decimal', transformer: {
        to: (value) => value, from: Number
    }})
    public price: number;

    @ManyToOne(() => Product, (product) => product.orderProducts)
    @JoinColumn({name: 'product_id'})
    public product: Product;

    @ManyToOne(() => Order, (order) => order.orderProducts)
    @JoinColumn({name: 'order_id'})
    public order: Order;

    public static fromDto(product: Product): OrderProduct {
        const orderProduct = new OrderProduct();
        const priceOffers = product.priceOffers;

        const hasOffer = priceOffers.length > 1 &&
            priceOffers.at(-1).status === PriceOfferStatus.APPROVED;

        const price = hasOffer
            ? priceOffers.at(-1).price
            : product.price;

        orderProduct.price = price;
        orderProduct.product = product;

        return orderProduct;
    }

    public static toDto(orderProduct: OrderProduct): OrderProductResponseDto {
        return {
            price: orderProduct.price,
            product: Product.toDto(orderProduct.product),
        }
    }
}
