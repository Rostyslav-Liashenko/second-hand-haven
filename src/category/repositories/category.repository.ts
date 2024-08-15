import { CustomRepository } from '../../typeorm-ex/typeorm-ex.decorator';
import { Category } from '../entities/category.entity';
import { BaseRepository } from '../../core/repositories/base.repository';

@CustomRepository(Category)
export class CategoryRepository extends BaseRepository<Category> {
    public async findById(categoryId: string): Promise<Category> {
        return await this.findOne({
            where: { id: categoryId },
            relations: { parent: true },
        });
    }

    public async findByAttributeId(attributeId: string): Promise<Category[]> {
        return await this.find({
            where: {
                categoryAttributes: {
                    attribute: { id: attributeId}
                },
            },
            order: {
                createdAt: 'ASC'
            }
        });
    }

    public async findFlatChildren(parentCategoryId: string): Promise<Category[]> {
        const categoryParent = await this.findById(parentCategoryId);

        return await this.manager.getTreeRepository(Category)
            .createDescendantsQueryBuilder(
                'category',
                'category_closure',
                categoryParent
            )
            .offset(1)
            .getMany();
    }

    public async findFlatChildrenIncludeParent(parentCategoryId: string): Promise<Category[]> {
        const categoryParent = await this.findById(parentCategoryId);

        return await this.manager.getTreeRepository(Category).findDescendants(categoryParent);
    }
}