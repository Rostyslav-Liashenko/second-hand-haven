import { Injectable } from '@nestjs/common';
import { BaseService } from '../../core/services/base.service';
import { UnitOfWorkService } from '../../core/services/unit-of-work.service';
import { Category } from '../entities/category.entity';
import { CategoryRequestDto } from '../dtos/request/category.request.dto';
import { SubcategoryRequestDto } from '../dtos/request/subcategory.request.dto';
import { CategoryTreeResponseDto } from '../dtos/response/category-tree.response.dto';
import { NotFoundException } from '../../core/exceptions/not-found.exception';
import { AdjacentCategoryRequestDto } from '../dtos/request/adjacent-category-request.dto';

@Injectable()
export class CategoryService extends BaseService {
    constructor(protected readonly unitOfWork: UnitOfWorkService) {
        super(unitOfWork);
    }

    public async findChildrenIdsIncludeParentId(categoryId): Promise<string[]> {
        const childrenCategories = await this.unitOfWork.categoryRepository.findFlatChildrenIncludeParent(categoryId);

        return childrenCategories.map((child) => child.id);
    }

    public async findFlatSubcategories(parentCategoryId: string): Promise<CategoryTreeResponseDto[]> {
        const categories = await this.unitOfWork.categoryRepository.findFlatChildren(parentCategoryId);

        return categories.map((category) => Category.toDto(category));
    }

    public async findById(categoryId: string): Promise<CategoryTreeResponseDto> {
        const category = await this.unitOfWork.categoryRepository.findById(categoryId);

        return Category.toDto(category);
    }

    public async findTreeCategories(): Promise<CategoryTreeResponseDto[]> {
        const subTree = await this.unitOfWork
            .dataSource
            .manager
            .getTreeRepository(Category)
            .findTrees();

        return subTree.map((partTree) => Category.toDto(partTree));
    }

    public async findSubtreeByDepth(depth: number): Promise<CategoryTreeResponseDto[]> {
        const subTree = await this.unitOfWork
            .dataSource
            .manager
            .getTreeRepository(Category)
            .findTrees({ depth })

        return subTree.map((partTree) => Category.toDto(partTree));
    }

    public async findCategoriesByAttributeId(attributeId: string): Promise<CategoryTreeResponseDto[]> {
        const categories = await this.unitOfWork.categoryRepository.findByAttributeId(attributeId);

        return categories.map((category) => Category.toDto(category));
    }

    public async create(categoryRequest: CategoryRequestDto): Promise<CategoryTreeResponseDto> {
        const work = async () => {
            const categoryFromDto = Category.fromDto(categoryRequest);
            categoryFromDto.order = await this.findOrderByRoot();
            const category = await this.unitOfWork.categoryRepository.save(categoryFromDto);

            return Category.toDto(category);
        }

        return await this.unitOfWork.doWork(work);
    }

    public async createSubcategory(subCategoryRequest: SubcategoryRequestDto): Promise<CategoryTreeResponseDto> {
        const work = async () => {
            const parent = await this.unitOfWork.categoryRepository.findById(subCategoryRequest.parentId);

            if (!parent) {
                throw new NotFoundException();
            }

            const order = await this.unitOfWork.dataSource.manager.getTreeRepository(Category).countDescendants(parent);
            const categoryFrom = Category.fromDto(subCategoryRequest);
            categoryFrom.parent = parent;
            categoryFrom.order = order;

            const category = await this.unitOfWork.categoryRepository.save(categoryFrom);

            return Category.toDto(category);
        }

        return await this.unitOfWork.doWork(work);
    }

    public async createAdjacent(
        adjacentCategoryRequestDto: AdjacentCategoryRequestDto
    ): Promise<CategoryTreeResponseDto> {
        const work = async () => {
            const adjacent = await this.unitOfWork.categoryRepository.findById(adjacentCategoryRequestDto.previousId);

            if (!adjacent) {
                throw new NotFoundException();
            }

            const parentCondition = await this.getParentCondition(adjacent);

            await this.unitOfWork.categoryRepository
                .createQueryBuilder()
                .update(Category)
                .set({order: () => 'order + 1'})
                .where('order > :adjacentOrder', { adjacentOrder: adjacent.order })
                .andWhere(parentCondition)
                .execute();

            const categoryFrom = Category.fromDto(adjacentCategoryRequestDto);
            categoryFrom.parent = adjacent.parent;
            categoryFrom.order = adjacent.order + 1;

            const category = await this.unitOfWork.categoryRepository.save(categoryFrom);

            return Category.toDto(category);
        }

        return await this.unitOfWork.doWork(work);
    }


    public async update(categoryId: string, categoryRequest: CategoryRequestDto): Promise<CategoryTreeResponseDto> {
        const work = async () => {
            const categoryFromDto = Category.fromDto(categoryRequest);

            const categoryToUpdate = await this.unitOfWork.categoryRepository.findById(categoryId);
            categoryToUpdate.name = categoryFromDto.name;

            const category = await this.unitOfWork.categoryRepository.save(categoryToUpdate);

            return Category.toDto(category);
        }

        return await this.unitOfWork.doWork(work);
    }

    public async delete(id: string): Promise<void> {
        const work = async () => {
            const category = await this.unitOfWork.categoryRepository.findById(id);

            const parentCondition = await this.getParentCondition(category);

            await this.unitOfWork.categoryRepository
                .createQueryBuilder()
                .update(Category)
                .set({order: () => 'order - 1'})
                .where('order > :categoryOrder', {categoryOrder: category.order})
                .andWhere(parentCondition)
                .execute();

            await this.unitOfWork
                .dataSource
                .manager
                .getTreeRepository(Category)
                .createQueryBuilder()
                .delete()
                .from(Category)
                .where('id = :id', {id})
                .execute();
        }

        return await this.unitOfWork.doWork(work);
    }

    private async findOrderByRoot(): Promise<number> {
        const roots = await this.unitOfWork.dataSource.manager.getTreeRepository(Category).findRoots();

        return roots.length + 1;
    }

    private async getParentCondition(category: Category): Promise<string> {
        return category.parent
            ? `parentId = '${category.parent.id}'`
            : `parentId IS NULL`;
    }
}