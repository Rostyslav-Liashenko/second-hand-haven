import { CustomRepository } from '../../typeorm-ex/typeorm-ex.decorator';
import { ProductCart } from '../entities/product-cart.entity';
import { BaseRepository } from '../../core/repositories/base.repository';

@CustomRepository(ProductCart)
export class ProductCartRepository extends BaseRepository<ProductCart> {
    public async findByUserIdAndProductId(userId: string, productId: string): Promise<ProductCart> {
        return this.findOne({
            where: {
                cart: {
                    user: { id: userId },
                },
                product: { id: productId}
            },
        });
    }

    public async findByUserIdAndOwnerId(userId: string, ownerId: string): Promise<ProductCart[]> {
        return this.find({
            where: {
                cart: {
                    user: { id: userId }
                },
                product: {
                    owner: { id: ownerId }
                },
            },
        });
    }

    public async findProductQuantityByUserId(userId: string): Promise<number> {
        return this.count({
            where: {
                cart: {
                    user: { id: userId },
                },
            },
        });
    }

    public async deleteByProductId(productId: string): Promise<void> {
        await this.createQueryBuilder('productCart')
            .innerJoin('productCart.product', 'product')
            .where('product.id = :productId', {productId})
            .delete()
            .execute();
    }

    public async softDeleteByProductId(productId: string): Promise<void> {
        await this.createQueryBuilder('productCart')
            .innerJoin('productCart.product', 'product')
            .softDelete()
            .where('product.id = :productId', {productId})
            .execute();
    }

    public async softDeleteByProductIds(productIds: string[]): Promise<void> {
        await this.createQueryBuilder('productCart')
            .innerJoin('productCart.product', 'product')
            .softDelete()
            .where('product.id IN (:...productIds)', {productIds})
            .execute();
    }

    public async deleteByIds(productCartIds: string[]): Promise<void> {
        await this.createQueryBuilder('productCart')
            .where('id IN (:...ids)', {ids: productCartIds})
            .delete()
            .execute();
    }
}
