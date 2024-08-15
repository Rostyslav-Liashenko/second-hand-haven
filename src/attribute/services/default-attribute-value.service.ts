import { BaseService } from '../../core/services/base.service';
import { UnitOfWorkService } from '../../core/services/unit-of-work.service';
import { DefaultAttributeValueResponseDto } from '../dtos/response/default-attribute-value.response.dto';
import { DefaultAttributeValue } from '../entities/default-attribute-value.entity';
import { Injectable } from '@nestjs/common';
import { DefaultAttributeValueRequestDto } from '../dtos/request/default-attribute-value.request.dto';
import { AttributeResponseDto } from '../dtos/response/attribute.response.dto';
import { AttributeType } from '../enums/attribute-type.enum';
import { Attribute } from '../entities/attribute.entity';
import { UpdateDefaultAttributeValueRequestDto } from '../dtos/request/update-default-attribute-value.request.dto';
import { NotFoundException } from '../../core/exceptions/not-found.exception';
import { InvalidCredentialsException } from '../../core/exceptions/invalid-credentials.exception';
import {
    UpdateManyDefaultAttributeValueRequestDto
} from '../dtos/request/update-many-default-attribute.value.request.dto';


@Injectable()
export class DefaultAttributeValueService extends BaseService {
    constructor(protected readonly unitOfWork: UnitOfWorkService) {
        super(unitOfWork);
    }

    public async findByAttributeId(attributeId: string): Promise<DefaultAttributeValueResponseDto[]> {
        const defaultAttributeValues = await this.unitOfWork
            .defaultAttributeValueRepository.findByAttributeId(attributeId);

        return defaultAttributeValues.map((defaultAttribute) => DefaultAttributeValue.toDto(defaultAttribute));
    }

    public async findByCategoryId(categoryId: string): Promise<AttributeResponseDto[]> {
        const defaultAttributes = await this.unitOfWork.defaultAttributeValueRepository.findByCategoryId(categoryId);
        const additionalAttributeTypes = [AttributeType.INPUT, AttributeType.NUMBER_INPUT, AttributeType.CHECKBOX];

        const additionalAttributes = await this.unitOfWork.attributeRepository.findByCategoryIdAndTypes(categoryId, additionalAttributeTypes);
        const attributeResponseDto = additionalAttributes.map((booleanAttribute) => Attribute.toDto(booleanAttribute));

        return [...attributeResponseDto, ...defaultAttributes];
    }

    public async create(
        defaultAttributeValueRequest: DefaultAttributeValueRequestDto
    ): Promise<DefaultAttributeValueResponseDto> {
        const work = async () => {
            const defaultAttributeValueFromDto = DefaultAttributeValue.fromDto(defaultAttributeValueRequest);
            const attributeId = defaultAttributeValueFromDto.attribute.id;
            const valueToCreate = defaultAttributeValueFromDto.value;

            const isValid = await this.validation(attributeId, valueToCreate);

            if (!isValid) {
                throw new InvalidCredentialsException();
            }

            const defaultAttributeValue = await this.unitOfWork
                .defaultAttributeValueRepository
                .save(defaultAttributeValueFromDto);

            return DefaultAttributeValue.toDto(defaultAttributeValue);
        }

        return await this.unitOfWork.doWork(work);
    }

    public async updateMany(
        updateManyDefaultAttributeValueRequestDto: UpdateManyDefaultAttributeValueRequestDto,
    ): Promise<DefaultAttributeValueResponseDto[]> {
        const { attributeId, defaultValues } = updateManyDefaultAttributeValueRequestDto;
        const defaultAttributeValuesFromDto = defaultValues.map(
            (defaultValue) => DefaultAttributeValue.fromAttributeIdAndValue(attributeId, defaultValue),
        );

        await this.unitOfWork.defaultAttributeValueRepository.deleteByAttributeId(attributeId);
        const defaultAttributeValues = await this.unitOfWork.defaultAttributeValueRepository.batchSave(defaultAttributeValuesFromDto);

        return defaultAttributeValues.map((defaultAttributeValue) => DefaultAttributeValue.toDto(defaultAttributeValue));
    }

    public async update(id: string, updateDto: UpdateDefaultAttributeValueRequestDto): Promise<DefaultAttributeValueResponseDto> {
        const work = async () => {
            const defaultAttributeValueFromDto = DefaultAttributeValue.fromUpdateDto(updateDto);
            const defaultAttributeValueToUpdate = await this.unitOfWork.defaultAttributeValueRepository.findById(id);

            if (!defaultAttributeValueToUpdate) {
                throw new NotFoundException();
            }

            defaultAttributeValueToUpdate.value = defaultAttributeValueFromDto.value;

            const defaultAttributeValue = await this.unitOfWork
                .defaultAttributeValueRepository
                .save(defaultAttributeValueToUpdate);

            return DefaultAttributeValue.toDto(defaultAttributeValue);
        }

        return await this.unitOfWork.doWork(work);
    }

    public async delete(id: string): Promise<void> {
        const work = async () => {
            const defaultAttributeValue = await this.unitOfWork.defaultAttributeValueRepository.findById(id);

            if (!defaultAttributeValue) {
                throw new NotFoundException();
            }

            await this.unitOfWork.defaultAttributeValueRepository.remove(defaultAttributeValue);
        }

        return await this.unitOfWork.doWork(work);
    }

    private async validation(attributeId: string, value: string): Promise<boolean> {
        const attribute = await this.unitOfWork.attributeRepository.findById(attributeId);

        if (!attribute) {
            throw new NotFoundException();
        }

        const isEmptyValue = value === '';
        const isValidType = this.isValidType(attribute.type, value);

        return !isEmptyValue && isValidType;
    }

    private isValidType(type: AttributeType, value: string): boolean {
        const booleanValues = ['true', 'false'];

        if (type === AttributeType.NUMBER_INPUT) {
            return !Number.isNaN(Number(value));
        } else if (type === AttributeType.CHECKBOX) {
            const transformedValue = value.trim().toLowerCase();

            return booleanValues.includes(transformedValue);
        }

        return true;
    }
}