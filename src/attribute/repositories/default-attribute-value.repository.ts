import { CustomRepository } from '../../typeorm-ex/typeorm-ex.decorator';
import { DefaultAttributeValue } from '../entities/default-attribute-value.entity';
import { BaseRepository } from '../../core/repositories/base.repository';
import { AttributeResponseDto } from '../dtos/response/attribute.response.dto';


@CustomRepository(DefaultAttributeValue)
export class DefaultAttributeValueRepository extends BaseRepository<DefaultAttributeValue> {

    public async findById(defaultAttributeId): Promise<DefaultAttributeValue> {
        return await this.findOne({
            where: {
                id: defaultAttributeId
            },
        });
    }

    public async findByAttributeId(attributeId): Promise<DefaultAttributeValue[]> {
        return await this.find({
            where: {
                attribute: {id : attributeId}
            },
            order: {
                createdAt: 'ASC',
            },
        });
    }

    public async findByCategoryId(categoryId: string): Promise<AttributeResponseDto[]> {
        return await this.createQueryBuilder('defaultAttributeValue')
            .innerJoin('defaultAttributeValue.attribute', 'attribute')
            .innerJoin('attribute.categoryAttributes', 'categoryAttributes')
            .select(`ARRAY_AGG(DISTINCT defaultAttributeValue.value) as "values", attribute.name as "name",
                    attribute.isSortable as "isSortable", attribute.isFilterable as "isFilterable",
                    attribute.type as "type", attribute.id as "id"`)
            .where(`categoryAttributes.category.id = :categoryId`, {categoryId})
            .groupBy('attribute.name, attribute.isSortable, attribute.isFilterable, attribute.type, attribute.id')
            .getRawMany();
    }

    public async deleteByAttributeId(attributeId: string): Promise<void> {
        await this.createQueryBuilder('defaultAttributeValue')
            .innerJoin('defaultAttributeValue.attribute', 'attribute')
            .where('attribute.id = :attributeId', {attributeId})
            .delete()
            .execute();
    }

    public async softDeleteByAttributeId(attributeId: string): Promise<void> {
        await this.createQueryBuilder('defaultAttributeValue')
            .innerJoin('defaultAttributeValue.attribute', 'attribute')
            .softDelete()
            .where('attribute.id = :attributeId', {attributeId})
            .execute();
    }
}