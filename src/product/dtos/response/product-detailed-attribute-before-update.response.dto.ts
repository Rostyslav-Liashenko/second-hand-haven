import { UserResponseDto } from '../../../user/dtos/response/user.response.dto';
import { CategoryTreeResponseDto } from '../../../category/dtos/response/category-tree.response.dto';
import { ProductImageResponseDto } from './product-image.response.dto';
import { AttributeResponseDto } from '../../../attribute/dtos/response/attribute.response.dto';

export class ProductDetailedAttributeBeforeUpdateResponseDto {
    public id: string;
    public name: string;
    public price: number;
    public reservedPrice: number;
    public description: string;
    public createdAt: Date;
    public owner: UserResponseDto;
    public category: CategoryTreeResponseDto;
    public productImages: ProductImageResponseDto[];
    public attributes: AttributeResponseDto[];
    public isInWishlist: boolean;
    public isSold: boolean;
}
