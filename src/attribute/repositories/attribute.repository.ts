import { CustomRepository } from '../../typeorm-ex/typeorm-ex.decorator';
import { Attribute } from '../entities/attribute.entity';
import { BaseRepository } from '../../core/repositories/base.repository';
import { AttributeResponseDto } from '../dtos/response/attribute.response.dto';
import { AttributeType } from '../enums/attribute-type.enum';
import { In } from 'typeorm';

@CustomRepository(Attribute)
export class AttributeRepository extends BaseRepository<Attribute> {
    public async findAll(): Promise<Attribute[]> {
        return await this.find({
            order: {
                createdAt: 'ASC',
            },
        });
    }

    public async findById(id: string): Promise<Attribute> {
        return this.findOne({
            where: { id }
        });
    }

    public async findByProductId(productId: string): Promise<Attribute[]> {
        return this.find({
            where: {
                productAttributes: {
                    product: { id: productId }
                },
            },
            relations: {
                productAttributes: true,
            },
        })
    }

    public async findByCategoryId(categoryId: string): Promise<Attribute[]> {
        return this.find({
            where: {
                categoryAttributes: {
                    category: { id: categoryId}
                },
            },
        });
    }

    public async findByCategoryIdAndTypes(categoryId: string, types: AttributeType[] ): Promise<Attribute[]> {
        return this.find({
            where: {
                type: In(types),
                categoryAttributes: {
                    category: { id: categoryId }
                },
            },
        });
    }

    public async findByCategoryIds(categoryIds: string[]): Promise<AttributeResponseDto[]> {
        return await this.createQueryBuilder('attribute')
            .innerJoin('attribute.productAttributes', 'productAttribute')
            .innerJoin('productAttribute.product', 'product')
            .select(`ARRAY_AGG(DISTINCT productAttribute.value) as "values", attribute.name as "name",
                    attribute.isSortable as "isSortable", attribute.isFilterable as "isFilterable",
                    attribute.type as "type", attribute.id as "id"`)
            .where('product.category.id IN (:...categoryIds) AND productAttribute.value IS NOT NULL', { categoryIds })
            .groupBy('attribute.name, attribute.isSortable, attribute.isFilterable, attribute.type, attribute.id')
            .getRawMany();
    }
}