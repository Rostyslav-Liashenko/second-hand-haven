import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { Product } from '../../product/entities/product.entity';
import { User } from '../../user/entities/user.entity';
import { CreatePriceOfferRequestDto } from '../dtos/request/create-price-offer.request.dto';
import { PriceOfferResponseDto } from '../dtos/response/price-offer.response.dto';
import { UpdatePriceOfferRequestDto } from '../dtos/request/update-price-offer.request.dto';
import { PriceOfferStatus } from '../enums/price-offer-status.enum';

@Entity({name: 'price_offer'})
export class PriceOffer extends BaseEntity {

    @Column({name: 'price', type: 'decimal', default: 0, transformer: {
        from: Number, to: value => value
    }})
    public price: number;

    @Column({
        name: 'status',
        type: 'enum',
        enum: PriceOfferStatus,
        default: PriceOfferStatus.EXPECTED
    })
    public status: PriceOfferStatus;

    @ManyToOne(() => Product, (product) => product.priceOffers)
    @JoinColumn({name: 'product_id'})
    public product: Product;

    @ManyToOne(() => User, (user) => user.priceOffers)
    @JoinColumn({name: 'user_id'})
    public buyer: User;

    public static fromCreateDto(createProductOfferRequestDto: CreatePriceOfferRequestDto): PriceOffer {
        const productOffer = new PriceOffer();

        productOffer.product = { id: createProductOfferRequestDto.productId } as Product;
        productOffer.buyer = { id: createProductOfferRequestDto.buyerId } as User;
        productOffer.price = createProductOfferRequestDto.price;
        productOffer.status = PriceOfferStatus.EXPECTED;

        return productOffer;
    }

    public static fromUpdateDto(updateProductOfferRequestDto: UpdatePriceOfferRequestDto): PriceOffer {
        const productOffer = new PriceOffer();

        productOffer.product = { id: updateProductOfferRequestDto.productId } as Product;
        productOffer.buyer = { id: updateProductOfferRequestDto.buyerId } as User;
        productOffer.status = updateProductOfferRequestDto.status;

        return productOffer;
    }

    public static toDto(productOffer: PriceOffer): PriceOfferResponseDto {
        return {
            id: productOffer.id,
            productId: productOffer.product.id,
            buyerId: productOffer.buyer.id,
            price: productOffer.price,
            status: productOffer.status,
        }
    }
}