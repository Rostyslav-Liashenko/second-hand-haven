import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { Product } from './product.entity';
import { ProductImageResponseDto } from '../dtos/response/product-image.response.dto';
import * as process from 'node:process';
import { ProductImageRequestDto } from '../dtos/request/product-image.request.dto';
import { storageProductFolder } from '../../configs/upload-file-config';


@Entity({name: 'product_image'})
export class ProductImage extends BaseEntity {
    @Column({name: 'image', type: 'varchar', nullable: true})
    public image?: string;

    @ManyToOne(() => Product, (product) => product.productImages)
    @JoinColumn({name: 'product_id'})
    public product: Product;

    public static fromDto(productId: string, dto: ProductImageRequestDto): ProductImage {
        const productImage = new ProductImage();

        productImage.image = dto.image;
        productImage.product = { id: productId } as Product;

        return productImage;
    }

    public static toDto(productImage: ProductImage): ProductImageResponseDto {
        const prefix = `${process.env.BASE_SERVER_URL}${process.env.SERVER_PHOTO}/${storageProductFolder}`;

        return {
            image: `${prefix}/${productImage.image}`
        };
    }
}