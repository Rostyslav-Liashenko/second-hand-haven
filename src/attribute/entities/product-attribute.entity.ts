import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { Attribute } from './attribute.entity';
import { Product } from '../../product/entities/product.entity';

@Entity({name: 'product_attribute'})
export class ProductAttribute extends BaseEntity {

    @ManyToOne(() => Attribute, (attribute) => attribute.productAttributes)
    @JoinColumn({name: 'attribute_id'})
    public attribute: Attribute;

    @ManyToOne(() => Product, (product) => product.productAttributes)
    @JoinColumn({name: 'product_id'})
    public product: Product;

    @Column({name: 'value', type: 'varchar', nullable: true})
    public value: string;


    public static fromAttributeIdValues(attributeId: string, value: string): ProductAttribute {
        const productAttribute = new ProductAttribute();

        productAttribute.attribute = { id: attributeId } as Attribute;
        productAttribute.value = value;

        return  productAttribute;
    }
}