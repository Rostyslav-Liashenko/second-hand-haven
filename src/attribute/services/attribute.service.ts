import { Injectable } from '@nestjs/common';
import { BaseService } from '../../core/services/base.service';
import { UnitOfWorkService } from '../../core/services/unit-of-work.service';
import { AttributeRequestDto } from '../dtos/request/attribute.request.dto';
import { Attribute } from '../entities/attribute.entity';
import { CategoryAttributeRequestDto } from '../dtos/request/category-attribute.request.dto';
import { NotFoundException } from '../../core/exceptions/not-found.exception';
import { AttributeResponseDto } from '../dtos/response/attribute.response.dto';
import { CategoryService } from '../../category/services/category.service';
import { UpdateAttributeRequestDto } from '../dtos/request/update-attribute.request.dto';
import { UpdateAttributeResponseDto } from '../dtos/response/update-attribute.response.dto';
import { AttributeType } from '../enums/attribute-type.enum';
import { DefaultAttributeValue } from '../entities/default-attribute-value.entity';

@Injectable()
export class AttributeService extends BaseService {
    constructor(
        protected unitOfWork: UnitOfWorkService,
        private readonly categoryService: CategoryService
    ) {
        super(unitOfWork);
    }

    public async findAll(): Promise<AttributeResponseDto[]> {
        const attributes = await this.unitOfWork.attributeRepository.findAll();

        return attributes.map((attribute) => Attribute.toDto(attribute));
    }

    public async findById(attributeId: string): Promise<AttributeResponseDto> {
        const attribute = await this.unitOfWork.attributeRepository.findById(attributeId);

        return Attribute.toDto(attribute);
    }

    public async findByCategoryId(categoryId: string): Promise<AttributeResponseDto[]> {
        const categoryIds = await this.categoryService.findChildrenIdsIncludeParentId(categoryId);

        return await this.unitOfWork.attributeRepository.findByCategoryIds(categoryIds);
    }

    public async findByProductId(productId: string): Promise<AttributeResponseDto[]> {
        const attributes = await this.unitOfWork.attributeRepository.findByProductId(productId);

        return attributes.map((attribute) => Attribute.toDto(attribute));
    }

    public async create(attributeRequestDto: AttributeRequestDto): Promise<AttributeResponseDto> {
        const work = async () => {
            const attributeFromDto = Attribute.fromDto(attributeRequestDto);
            const attribute = await this.unitOfWork.attributeRepository.save(attributeFromDto);

            const hasDefaultAttributeValue = this.hasDefaultAttribute(attribute);
            const defaultValues = attributeRequestDto.defaultValues;

            if (defaultValues && hasDefaultAttributeValue) {
                const defaultAttributeValues = defaultValues.map(
                    (defaultValue) => DefaultAttributeValue.fromAttributeIdAndValue(attribute.id, defaultValue),
                );

                await this.unitOfWork.defaultAttributeValueRepository.batchSave(defaultAttributeValues);
            }

            return Attribute.toDto(attribute);
        }

        return await this.unitOfWork.doWork(work);
    }

    public async update(id: string, attributeUpdateDto: UpdateAttributeRequestDto): Promise<UpdateAttributeResponseDto> {
        const work = async () => {
            const attributeFromDto = Attribute.fromUpdateDot(attributeUpdateDto);
            const attributeToUpdate = await this.unitOfWork.attributeRepository.findById(id);

            if (!attributeToUpdate) {
                throw new NotFoundException();
            }

            if (attributeToUpdate.type !== attributeFromDto.type) {
                await this.unitOfWork.defaultAttributeValueRepository.deleteByAttributeId(attributeToUpdate.id);
            }

            attributeToUpdate.name = attributeFromDto.name;
            attributeToUpdate.type = attributeFromDto.type;
            attributeToUpdate.isFilterable = attributeFromDto.isFilterable;
            attributeToUpdate.isSortable = attributeFromDto.isSortable;
            attributeToUpdate.isRequired = attributeFromDto.isRequired;
            attributeToUpdate.meta = attributeFromDto.meta;

            const attribute = await this.unitOfWork.attributeRepository.save(attributeToUpdate);

            return Attribute.toUpdateDto(attribute);
        }

        return await this.unitOfWork.doWork(work);
    }

    public async delete(categoryAttributeRequestDto: CategoryAttributeRequestDto): Promise<void> {
        const work = async () => {
            const attribute = await this.unitOfWork.attributeRepository.findById(categoryAttributeRequestDto.attributeId);

            if (!attribute) {
                throw new NotFoundException();
            }

            const attributeId = attribute.id;
            await this.unitOfWork.defaultAttributeValueRepository.deleteByAttributeId(attributeId);
            await this.unitOfWork.attributeRepository.remove(attribute);
        }

        return await this.unitOfWork.doWork(work);
    }

    public findDefaultValue(attributeType: AttributeType): string | boolean | number {
        switch (attributeType) {
            case AttributeType.NUMBER_INPUT: {
                return 0;
            }
            case AttributeType.SINGLE_SELECTOR:
            case AttributeType.MULTI_SELECTOR:
            case AttributeType.INPUT: {
                return '';
            }
            case AttributeType.CHECKBOX: {
                return false;
            }
        }
    }

    public async softDeleteByAttributeId(attributeId: string): Promise<void> {
        const work = async () => {
            const attribute = await this.findById(attributeId);

            if (!attribute) {
                throw new NotFoundException();
            }

            await this.unitOfWork.defaultAttributeValueRepository.softDeleteByAttributeId(attribute.id);
            await this.unitOfWork.categoryAttributeRepository.softDeleteByAttributeId(attribute.id);
            await this.unitOfWork.attributeRepository.softRemove(attribute);
        }

        await this.unitOfWork.doWork(work);
    }

    private hasDefaultAttribute(attribute: Attribute): boolean {
        return attribute.type === AttributeType.SINGLE_SELECTOR
            || attribute.type === AttributeType.MULTI_SELECTOR;
    }
}