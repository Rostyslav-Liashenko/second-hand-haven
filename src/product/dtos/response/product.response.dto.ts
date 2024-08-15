import { UserResponseDto } from '../../../user/dtos/response/user.response.dto';
import { CategoryTreeResponseDto } from '../../../category/dtos/response/category-tree.response.dto';
import { ProductImageResponseDto } from './product-image.response.dto';

export class ProductResponseDto {
    public id: string;
    public name: string;
    public price: number;
    public description: string;
    public owner: UserResponseDto;
    public category: CategoryTreeResponseDto;
    public productImages: ProductImageResponseDto[];
    public createdAt: Date;
    public isInWishlist: boolean;
    public isSold: boolean;
}