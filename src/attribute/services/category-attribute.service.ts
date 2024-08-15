import { Injectable } from '@nestjs/common';
import { BaseService } from '../../core/services/base.service';
import { UnitOfWorkService } from '../../core/services/unit-of-work.service';
import { CategoryAttributeResponseDto } from '../dtos/response/category-attribute.response.dto';
import { CategoryAttribute } from '../entities/category-attribute.entity';
import { UpdateCategoryAttributeRequestDto } from '../dtos/request/update-category-attribute.request.dto';
import { CategoryAttributeRequestDto } from '../dtos/request/category-attribute.request.dto';
import { CategoryService } from '../../category/services/category.service';

@Injectable()
export class CategoryAttributeService extends BaseService {
    constructor(
        protected readonly unitOfWork: UnitOfWorkService,
        private readonly categoryService: CategoryService,
    ) {
        super(unitOfWork);
    }

    public async find(): Promise<CategoryAttributeResponseDto[]> {
        const categoryAttributes = await this.unitOfWork.categoryAttributeRepository.findAll();

        return categoryAttributes.map((categoryAttribute) => CategoryAttribute.toDto(categoryAttribute));
    }

    public async findByCategoryId(categoryId: string): Promise<CategoryAttributeResponseDto[]> {
        const categoryAttributes = await this.unitOfWork.categoryAttributeRepository.findByCategoryId(categoryId);

        return categoryAttributes.map((categoryAttribute) => CategoryAttribute.toDto(categoryAttribute));
    }

    public async update(updateCategoryRequest: UpdateCategoryAttributeRequestDto): Promise<void> {
        const work = async () => {
            const { categoryId, attributeIds } = updateCategoryRequest;

            const categoryChildrenIdsAndParentId = await this.categoryService.findChildrenIdsIncludeParentId(categoryId);
            const categoryAttributeRequestDtos: CategoryAttributeRequestDto[] = [];

            categoryChildrenIdsAndParentId.forEach((categoryId) => {
                const categoryAttributesByCategoryId: CategoryAttributeRequestDto[] = attributeIds.map((attributeId) => ({
                    categoryId,
                    attributeId,
                }));

                categoryAttributeRequestDtos.push(...categoryAttributesByCategoryId);
            })

            const categoryAttribute = categoryAttributeRequestDtos.map(
                (dto) => CategoryAttribute.fromCategoryAttributeRequest(dto),
            );

            await this.unitOfWork.categoryAttributeRepository.deleteByCategoryIds(categoryChildrenIdsAndParentId);
            await this.unitOfWork.categoryAttributeRepository.batchSave(categoryAttribute);
        }

        await this.unitOfWork.doWork(work);
    }
}
