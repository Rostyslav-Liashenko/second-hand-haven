import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { Category } from '../../category/entities/category.entity';
import { Attribute } from './attribute.entity';
import { CategoryAttributeResponseDto } from '../dtos/response/category-attribute.response.dto';
import { CategoryAttributeRequestDto } from '../dtos/request/category-attribute.request.dto';

@Entity({name: 'category_attribute'})
export class CategoryAttribute extends BaseEntity {

    @ManyToOne(() => Category, (category) => category.categoryAttributes)
    @JoinColumn({name: 'category_id'})
    public category: Category;

    @ManyToOne(() => Attribute, (attribute) => attribute.categoryAttributes)
    @JoinColumn({name: 'attribute_id'})
    public attribute: Attribute;

    public static toDto(categoryAttribute: CategoryAttribute): CategoryAttributeResponseDto {
        return categoryAttribute && {
            id: categoryAttribute.id,
            attribute: Attribute.toDto(categoryAttribute.attribute),
            category: Category.toDto(categoryAttribute.category),
        }
    }

    public static fromCategoryAttributeRequest(dto: CategoryAttributeRequestDto): CategoryAttribute {
        const categoryAttribute = new CategoryAttribute();

        categoryAttribute.attribute = { id: dto.attributeId } as Attribute;
        categoryAttribute.category = { id: dto.categoryId } as Category;

        return categoryAttribute;
    }
}
