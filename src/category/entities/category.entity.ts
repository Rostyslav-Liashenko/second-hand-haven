import { Column, Entity, OneToMany, Tree, TreeChildren, TreeParent } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { CategoryRequestDto } from '../dtos/request/category.request.dto';
import { CategoryTreeResponseDto } from '../dtos/response/category-tree.response.dto';
import { Product } from '../../product/entities/product.entity';
import { CategoryAttribute } from '../../attribute/entities/category-attribute.entity';

@Entity({name: 'category'})
@Tree('closure-table')
export class Category extends BaseEntity {
    @Column({name: 'name', type: 'varchar'})
    public name: string;

    @Column({name: 'order', type: 'integer', default: 0})
    public order: number;

    @TreeParent({ onDelete: 'CASCADE' })
    public parent: Category;

    @TreeChildren()
    public children: Category[];

    @OneToMany(() => Product, (product) => product.category)
    public products: Product[];

    @OneToMany(() => CategoryAttribute, (categoryAttribute) => categoryAttribute.category)
    public categoryAttributes: CategoryAttribute[];

    public static fromDto(dto: CategoryRequestDto): Category {
        const category = new Category();

        category.name = dto.name;

        return category;
    }

    public static toDto(category: Category): CategoryTreeResponseDto {
        return category && {
            id: category.id,
            name: category.name,
            order: category.order,
            children: (category.children || []).map((category) => Category.toDto(category)),
        };
    }
}