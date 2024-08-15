import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { Cart } from './cart.entity';
import { Product } from '../../product/entities/product.entity';
import { ProductCartResponseDto } from '../dtos/responses/product-cart.response.dto';
import { ProductCartRequestDto } from '../dtos/request/product-cart.request.dto';

@Entity({name: 'product_cart'})
export class ProductCart extends BaseEntity {

    @ManyToOne(() => Cart, (cart) => cart.productCart)
    @JoinColumn({name: 'cart_id'})
    public cart: Cart;

    @ManyToOne(() => Product, (product) => product.productCart)
    @JoinColumn({name: 'product_id'})
    public product: Product;

    @Column({type: 'integer', default: 1})
    public quantity: number;

    public static fromDto(dto: ProductCartRequestDto, cartId: string): ProductCart {
        const productCart = new ProductCart();

        productCart.product = { id: dto.productId } as Product;
        productCart.cart = { id: cartId } as Cart;

        return productCart;
    }

    public static toDto(productCart: ProductCart): ProductCartResponseDto {
        return {
            productId: productCart.product.id,
            quantity: productCart.quantity,
        }
    }
}