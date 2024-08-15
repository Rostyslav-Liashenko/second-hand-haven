import { CustomRepository } from '../../typeorm-ex/typeorm-ex.decorator';
import { Cart } from '../entities/cart.entity';
import { BaseRepository } from '../../core/repositories/base.repository';
import { PriceOffer } from '../../price-offer/entities/price-offer.entity';


@CustomRepository(Cart)
export class CartRepository extends BaseRepository<Cart>{
    public async generateCart(userId: string): Promise<void> {
        const cart = {
            user: { id: userId }
        };

        await this.save(cart);
    }

    public async findByUserId(userId: string): Promise<Cart> {
        const subQuery = this.manager
            .createQueryBuilder()
            .select('priceOffer.id')
            .from(PriceOffer, 'priceOffer')
            .innerJoin('priceOffer.buyer', 'buyer')
            .where(`buyer.id = '${userId}'`);

        return this.createQueryBuilder('cart')
            .innerJoinAndSelect('cart.user', 'user')
            .leftJoinAndSelect('cart.productCart', 'productCart')
            .leftJoinAndSelect('productCart.product', 'product')
            .leftJoinAndSelect('product.owner', 'owner')
            .leftJoinAndSelect('product.category', 'category')
            .leftJoinAndSelect('product.productImages', 'productImages')
            .leftJoinAndSelect(
                'product.priceOffers',
                'priceOffers',
                `priceOffers.id IN (${subQuery.getQuery()})`
            )
            .andWhere('user.id = :userId', {userId})
            .orderBy('priceOffers.createdAt', 'ASC')
            .getOne();
    }

    public async softDeleteByUserId(userId: string): Promise<void> {
        await this.createQueryBuilder('cart')
            .innerJoin('cart.user', 'user')
            .softDelete()
            .where('user.id = :userId', {userId})
            .execute();
    }
}