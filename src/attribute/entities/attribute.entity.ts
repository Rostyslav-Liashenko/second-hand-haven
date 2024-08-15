import { BaseEntity } from '../../core/entities/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { AttributeType } from '../enums/attribute-type.enum';
import { CategoryAttribute } from './category-attribute.entity';
import { ProductAttribute } from './product-attribute.entity';
import { AttributeRequestDto } from '../dtos/request/attribute.request.dto';
import { AttributeResponseDto } from '../dtos/response/attribute.response.dto';
import { DefaultAttributeValue } from './default-attribute-value.entity';
import { UpdateAttributeRequestDto } from '../dtos/request/update-attribute.request.dto';
import { UpdateAttributeResponseDto } from '../dtos/response/update-attribute.response.dto';
import { MaxMinRangeDto } from '../dtos/request/max-min-range.dto';

@Entity({name: 'attribute'})
export class Attribute extends BaseEntity {
    @Column({name: 'name', type: 'varchar', length: '200'})
    public name: string;

    @Column({
        name: 'type',
        type: 'enum',
        enum: AttributeType,
        default: AttributeType.SINGLE_SELECTOR
    })
    public type: AttributeType;

    @Column({name: 'is_sortable', type: 'boolean', default: false})
    public isSortable: boolean;

    @Column({name: 'is_filterable', type: 'boolean', default: false})
    public isFilterable: boolean;

    @Column({name: 'is_required', type: 'boolean', default: false})
    public isRequired: boolean;

    @Column({
        type: 'jsonb',
        nullable: true,
    })
    public meta: MaxMinRangeDto;

    @OneToMany(() => CategoryAttribute, (categoryAttribute) => categoryAttribute.attribute)
    public categoryAttributes: CategoryAttribute[];

    @OneToMany(() => ProductAttribute, (productAttribute) => productAttribute.attribute)
    public productAttributes: ProductAttribute[];

    @OneToMany(() => DefaultAttributeValue, (defaultAttributeValue) => defaultAttributeValue.attribute)
    public defaultAttributeValues: DefaultAttributeValue[];

    public static fromUpdateDot(dto: UpdateAttributeRequestDto): Attribute {
        const attribute = new Attribute();

        attribute.name = dto.name;
        attribute.type = dto.type;
        attribute.isFilterable = dto.isFilterable;
        attribute.isSortable = dto.isSortable;
        attribute.isRequired = dto.isRequired;
        attribute.meta = dto.meta;

        return attribute;
    }

    public static toUpdateDto(attribute: Attribute): UpdateAttributeResponseDto {
        return {
            id: attribute.id,
            name: attribute.name,
            type: attribute.type,
            isFilterable: attribute.isFilterable,
            isSortable: attribute.isSortable,
            isRequired: attribute.isRequired,
            meta: attribute.meta ?? undefined,
        };
    }

    public static fromDto(dto: AttributeRequestDto): Attribute {
        const attribute = new Attribute();

        attribute.name = dto.name;
        attribute.type = dto.type;
        attribute.isFilterable = dto.isFilterable;
        attribute.isSortable = dto.isSortable;
        attribute.isRequired = dto.isRequired;
        attribute.meta = dto.meta;

        return attribute;
    }

    public static toDto(attribute: Attribute): AttributeResponseDto {
        return attribute && {
            id: attribute.id,
            name: attribute.name,
            type: attribute.type,
            values: (attribute.productAttributes || []).map((productAttribute) => productAttribute.value),
            isFilterable: attribute.isFilterable,
            isSortable: attribute.isSortable,
            isRequired: attribute.isRequired,
            meta: attribute.meta ?? undefined,
        }
    }
}