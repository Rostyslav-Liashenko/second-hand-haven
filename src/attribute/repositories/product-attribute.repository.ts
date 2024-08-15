import { CustomRepository } from '../../typeorm-ex/typeorm-ex.decorator';
import { ProductAttribute } from '../entities/product-attribute.entity';
import { BaseRepository } from '../../core/repositories/base.repository';
import { Attribute } from '../entities/attribute.entity';
import { AttributeType } from '../enums/attribute-type.enum';
import { IdValuesRequestDto } from '../../core/dto/request/id-values.request.dto';

@CustomRepository(ProductAttribute)
export class ProductAttributeRepository extends BaseRepository<ProductAttribute> {

    public async batchInsert(attributeId: string, productId: string, values: string[]): Promise<void> {
        const insertValue = values.map((value) => `('${attributeId}', '${productId}', '${value}')`).join(', ');

        await this.query(
            `INSERT INTO product_attribute (attribute_id, product_id, value)
                VALUES
                ${insertValue}
            `
        );
    }

    public async batchInsertByIdValues(idValues: IdValuesRequestDto[], productId: string): Promise<void> {
        const attributeProductValues = idValues.map(
            (idValue) => idValue.values.map((value) => `('${idValue.id}', '${productId}', '${value}')`).join(', ')
        );

        const insertValue = attributeProductValues.join(', ');

        await this.query(
            `INSERT INTO product_attribute (attribute_id, product_id, value)
                VALUES
                ${insertValue}
            `
        );
    }

    public async batchInsertByCategoryIds(categoryIds: string[], attribute: Attribute): Promise<void> {
        const categories = categoryIds.map((categoryId) => `'${categoryId}'`).join(',');
        const defaultValue = this.findDefaultValue(attribute.type)

        await this.query(
            `INSERT INTO product_attribute (value, attribute_id, product_id)
                SELECT
                     ${defaultValue} as value,
                    '${attribute.id}' as attribute_id,
                    product.id as product_id
                FROM product
                JOIN category on product.category_id = category.id
                WHERE category.id IN (${categories})
            `
        );
    }

    public async deleteByCategoryIdsAndAttributeId(categoryIds: string[], attributeId: string): Promise<void> {
        const categories = categoryIds.map((categoryId) => `'${categoryId}'`).join(',');

        await this.query(
            `DELETE FROM product_attribute
                   USING category
                   WHERE product_attribute.attribute_id  = '${attributeId}' 
                   AND category.id IN (${categories})
            `
        );
    }

    public async deleteByProductId(productId: string): Promise<void> {
        await this.createQueryBuilder('productAttribute')
            .innerJoin('productAttribute.product', 'product')
            .where('product.id = :productId', {productId})
            .delete()
            .execute();
    }

    public async softDeleteByProductId(productId: string): Promise<void> {
        await this.createQueryBuilder('productAttribute')
            .innerJoin('productAttribute.product', 'product')
            .softDelete()
            .where('product.id = :productId', {productId})
            .execute();
    }

    public async softDeleteByProductIds(productIds: string[]): Promise<void> {
        await this.createQueryBuilder('productAttribute')
            .innerJoin('productAttribute.product', 'product')
            .softDelete()
            .where('product.id IN (:...productIds)', {productIds})
            .execute();
    }

    public async deleteByAttributeIdAndProductId(attributeId: string, productId: string): Promise<void> {
        await this.createQueryBuilder('productAttribute')
            .innerJoin('productAttribute.product', 'product')
            .innerJoin('productAttribute.attribute', 'attribute')
            .where('attribute.id = :attributeId', { attributeId })
            .andWhere('product.id = :productId', { productId })
            .delete()
            .execute();
    }

    private findDefaultValue(attributeType: AttributeType): string {
        return attributeType === AttributeType.CHECKBOX
            ? `'false'`
            : 'NULL';
    }
}