import { UserResponseDto } from '../../../user/dtos/response/user.response.dto';
import { AttributeResponseDto } from '../../../attribute/dtos/response/attribute.response.dto';
import { ProductImageResponseDto } from './product-image.response.dto';
import { CategoryTreeResponseDto } from '../../../category/dtos/response/category-tree.response.dto';

export class ProductDetailedAttributeResponseDto {
    public id: string;
    public name: string;
    public price: number;
    public description: string;
    public createdAt: Date;
    public owner: UserResponseDto;
    public category: CategoryTreeResponseDto;
    public productImages: ProductImageResponseDto[];
    public attributes: AttributeResponseDto[];
    public isInWishlist: boolean;
    public isSold: boolean;
}