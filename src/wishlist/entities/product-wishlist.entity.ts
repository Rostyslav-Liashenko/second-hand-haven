import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { Wishlist } from './wishlist.entity';
import { Product } from '../../product/entities/product.entity';
import { ProductWishlistRequestDto } from '../dtos/request/product-wishlist.request.dto';
import { ProductWishlistResponseDto } from '../dtos/response/product-wishlist.response.dto';

@Entity()
export class ProductWishlist extends BaseEntity {

    @ManyToOne(() => Wishlist, (wishlist) => wishlist.productWishlists)
    @JoinColumn({name: 'wishlist_id'})
    public wishlist: Wishlist;

    @ManyToOne(() => Product, (product) => product.productWishlists)
    @JoinColumn({name: 'product_id'})
    public product: Product;

    public static fromDto(dto: ProductWishlistRequestDto, wishlistId: string): ProductWishlist {
        const productWishlist = new ProductWishlist();

        productWishlist.product = {id: dto.productId} as Product;
        productWishlist.wishlist = {id: wishlistId} as Wishlist;

        return productWishlist;
    }

    public static toDto(productWishList: ProductWishlist): ProductWishlistResponseDto {
        return {
            productId: productWishList.product.id
        };
    }
}