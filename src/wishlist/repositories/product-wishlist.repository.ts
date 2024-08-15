import { CustomRepository } from '../../typeorm-ex/typeorm-ex.decorator';
import { ProductWishlist } from '../entities/product-wishlist.entity';
import { BaseRepository } from '../../core/repositories/base.repository';

@CustomRepository(ProductWishlist)
export class ProductWishlistRepository extends BaseRepository<ProductWishlist> {
    public async findByUserIdAndProductId(userId: string, productId: string): Promise<ProductWishlist> {
        return this.findOne({
            where: {
                wishlist: {
                    user: { id: userId },
                },
                product: { id: productId },
            },
        });
    }

    public async findQuantityProduct(productId: string): Promise<number> {
        return this.count({
            where: {
                product: { id: productId}
            }
        });
    }

    public async deleteByProductId(productId: string): Promise<void> {
        await this.createQueryBuilder('productWishlist')
            .innerJoin('productWishlist.product', 'product')
            .where('product.id = :productId', {productId})
            .delete()
            .execute();
    }

    public async softDeleteByProductId(productId: string): Promise<void> {
        await this.createQueryBuilder('productWishlist')
            .innerJoin('productWishlist.product', 'product')
            .softDelete()
            .where('product.id = :productId', {productId})
            .execute();
    }

    public async softDeleteByProductIds(productIds: string[]): Promise<void> {
        await this.createQueryBuilder('productWishlist')
            .innerJoin('productWishlist.product', 'product')
            .softDelete()
            .where('product.id IN (:...productIds)', {productIds})
            .execute();
    }
}