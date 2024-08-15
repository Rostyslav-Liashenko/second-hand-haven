import { CustomRepository } from '../../typeorm-ex/typeorm-ex.decorator';
import { ProductImage } from '../entities/product-image.entity';
import { BaseRepository } from '../../core/repositories/base.repository';


@CustomRepository(ProductImage)
export class ProductImageRepository extends BaseRepository<ProductImage> {

    public async deleteByProductId(productId: string): Promise<void> {
        await this.createQueryBuilder('productImage')
            .innerJoin('productImage.product', 'product')
            .where('product.id = :productId', {productId})
            .delete()
            .execute();
    }

    public async softDeleteByProductId(productId: string): Promise<void> {
        await this.createQueryBuilder('productImage')
            .innerJoin('productImage.product', 'product')
            .softDelete()
            .where('product.id = :productId', {productId})
            .execute();
    }

    public async softDeleteByProductIds(productIds: string[]): Promise<void> {
        await this.createQueryBuilder('productImage')
            .innerJoin('productImage.product', 'product')
            .softDelete()
            .where('product.id IN (:...productIds)', {productIds})
            .execute();
    }
}