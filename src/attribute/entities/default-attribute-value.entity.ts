import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { Attribute } from './attribute.entity';
import { DefaultAttributeValueResponseDto } from '../dtos/response/default-attribute-value.response.dto';
import { DefaultAttributeValueRequestDto } from '../dtos/request/default-attribute-value.request.dto';
import { UpdateDefaultAttributeValueRequestDto } from '../dtos/request/update-default-attribute-value.request.dto';


@Entity({name: 'default_attribute_value'})
export class DefaultAttributeValue extends BaseEntity {

    @ManyToOne(() => Attribute, (attribute) => attribute.defaultAttributeValues)
    public attribute: Attribute;

    @Column({name: 'value', type: 'varchar'})
    public value: string;

    public static fromDto(dto: DefaultAttributeValueRequestDto): DefaultAttributeValue {
        const defaultAttributeValue = new DefaultAttributeValue();

        defaultAttributeValue.attribute = { id: dto.attributeId } as Attribute;
        defaultAttributeValue.value = dto.value;

        return defaultAttributeValue;
    }

    public static toDto(defaultAttributeValue: DefaultAttributeValue): DefaultAttributeValueResponseDto {
        return {
            id: defaultAttributeValue.id,
            value: defaultAttributeValue.value,
        }
    }

    public static fromUpdateDto(dto: UpdateDefaultAttributeValueRequestDto): DefaultAttributeValue {
        const defaultAttributeValue = new DefaultAttributeValue();

        defaultAttributeValue.value = dto.value;

        return defaultAttributeValue;
    }

    public static fromAttributeIdAndValue(attributeId: string, value: string): DefaultAttributeValue {
        const defaultAttributeValue = new DefaultAttributeValue();

        defaultAttributeValue.attribute = { id: attributeId } as Attribute;
        defaultAttributeValue.value = value;

        return defaultAttributeValue;
    }
}