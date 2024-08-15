import { CustomRepository } from '../../typeorm-ex/typeorm-ex.decorator';
import { CategoryAttribute } from '../entities/category-attribute.entity';
import { BaseRepository } from '../../core/repositories/base.repository';

@CustomRepository(CategoryAttribute)
export class CategoryAttributeRepository extends BaseRepository<CategoryAttribute> {

    public async findAll(): Promise<CategoryAttribute[]> {
        return await this.find({
            order: {
                createdAt: 'ASC',
            },
            relations: {
                attribute: true,
                category: true,
            },
        });
    }

    public async findByCategoryId(categoryId: string): Promise<CategoryAttribute[]> {
        return await this.find({
            where: {
                category: {
                    id: categoryId,
                },
            },
            relations: {
                attribute: true,
                category: true,
            },
        });
    }

    public async findCount(attributeId: string): Promise<number> {
        return await this.count({
            where: {
                attribute: { id: attributeId }
            },
        });
    }

    public async batchInsert(categoryIds: string[], attributeId: string): Promise<void> {
        const categories = categoryIds.map((categoryId) => `('${categoryId}', '${attributeId}')`).join(',');

        await this.query(
            `INSERT INTO category_attribute (category_id, attribute_id) 
                VALUES ${categories}
            `
        );
    }

    public async batchDelete(categoryIds: string[], attributeId: string): Promise<void> {
        await this.createQueryBuilder('categoryAttribute')
            .innerJoinAndSelect('categoryAttribute.category', 'category')
            .innerJoinAndSelect('categoryAttribute.attribute', 'attribute')
            .where('category.id in (:...categoryIds)', {categoryIds})
            .andWhere('attribute.id = :attributeId', {attributeId})
            .delete()
            .execute();
    }

    public async deleteByCategoryIds(categoryIds: string[]): Promise<void> {
        await this.createQueryBuilder('categoryAttribute')
            .innerJoinAndSelect('categoryAttribute.category', 'category')
            .where('category.id In (:...categoryIds)', {categoryIds})
            .delete()
            .execute();
    }

    public async softDeleteByAttributeId(attributeId: string): Promise<void> {
        await this.createQueryBuilder('categoryAttribute')
            .innerJoinAndSelect('categoryAttribute.attribute', 'attribute')
            .softDelete()
            .where('attribute.id = :attributeId', {attributeId})
            .execute();
    }
}