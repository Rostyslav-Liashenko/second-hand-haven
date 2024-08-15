import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { Category } from '../../category/entities/category.entity';
import { UpdateProductRequestDto } from '../dtos/request/update-product.request.dto';
import { ProductResponseDto } from '../dtos/response/product.response.dto';
import { ProductWishlist } from '../../wishlist/entities/product-wishlist.entity';
import { ProductCart } from '../../cart/entities/product-cart.entity';
import { ProductAttribute } from '../../attribute/entities/product-attribute.entity';
import { Attribute } from '../../attribute/entities/attribute.entity';
import { ProductDetailedAttributeResponseDto } from '../dtos/response/product-detailed-attribute.response.dto';
import { ProductImage } from './product-image.entity';
import { Chat } from '../../chat/entities/chat.entity';
import { OrderProduct } from '../../order/entities/order-product.entity';
import { PriceOffer } from '../../price-offer/entities/price-offer.entity';
import { CreateProductRequestDto } from '../dtos/request/create-product.request.dto';

@Entity({name: 'product'})
export class Product extends BaseEntity {
    @Column({name: 'name', type: 'varchar'})
    public name: string;

    @Column({name: 'price', type: 'decimal', transformer: {
        to: (value) => value,
        from: Number
    }})
    public price: number;

    @Column({name: 'description', type: 'varchar', length: 5000, nullable: true})
    public description: string;

    @Column({name: 'count_view', type: 'decimal', default: 0, transformer: {
        to: (value) => value,
        from: Number
    }})
    public countView: number;

    @Column({name: 'reserved_price', type: 'decimal', nullable: true, transformer: {
        to: (value) => value,
        from: Number
    }})
    public reservedPrice?: number;

    @Column({name: 'is_sold', type: 'boolean', default: false})
    public isSold: boolean;

    @ManyToOne(() => User, (user) => user.products)
    @JoinColumn({name: 'owner_id'})
    public owner: User;

    @ManyToOne(() => Category, (category) => category.products)
    @JoinColumn({name: 'category_id'})
    public category: Category;

    @OneToMany(() => ProductWishlist, (productWishlist) => productWishlist.product)
    public productWishlists: ProductWishlist[];

    @OneToMany(() => ProductCart, (productCart) => productCart.product)
    public productCart: ProductCart[];

    @OneToMany(() => ProductAttribute, (productAttribute) => productAttribute.product, {cascade: true})
    public productAttributes: ProductAttribute[];

    @OneToMany(() => ProductImage, (productImage) => productImage.product, {cascade: true})
    public productImages: ProductImage[];

    @OneToMany(() => Chat, (chat) => chat.product)
    public chats: Chat[];

    @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.product)
    public orderProducts: OrderProduct[];

    @OneToMany(() => PriceOffer, (priceOffer) => priceOffer.product)
    public priceOffers: PriceOffer[];

    public static fromCreateProductRequest(productDto: CreateProductRequestDto): Product {
        return Product.fromUpdateProductRequest(productDto);
    }

    public static fromUpdateProductRequest(productDto: UpdateProductRequestDto): Product {
        const product = new Product();

        product.name = productDto.name;
        product.price = productDto.price;
        product.description = productDto.description;
        product.owner = {id: productDto.ownerId} as User;
        product.category = {id: productDto.categoryId} as Category;
        product.reservedPrice = productDto.reservedPrice;

        return product;
    }

    public static toDto(product: Product): ProductResponseDto {
        return product && {
            id: product.id,
            name: product.name,
            price: product.price,
            description: product.description,
            owner: User.toDto(product.owner),
            productImages: (product.productImages || []).map((productImage) => ProductImage.toDto(productImage)),
            category: Category.toDto(product.category),
            createdAt: product.createdAt,
            isInWishlist: (product.productWishlists ?? []).length > 0,
            isSold: product.isSold,
        }
    }

    public static toProductDetailedAttributesDto(
        product: Product,
        attributes: Attribute[]
    ): ProductDetailedAttributeResponseDto {
        return {
            id: product.id,
            name: product.name,
            price: product.price,
            description: product.description,
            createdAt: product.createdAt,
            owner: User.toDto(product.owner),
            category: Category.toDto(product.category),
            productImages: (product.productImages || []).map((productImage) => ProductImage.toDto(productImage)),
            attributes: attributes.map((attribute) => Attribute.toDto(attribute)),
            isInWishlist: (product.productWishlists ?? []).length > 0,
            isSold: product.isSold,
        }
    }
}