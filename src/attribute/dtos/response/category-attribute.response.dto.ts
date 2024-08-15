import { CategoryTreeResponseDto } from '../../../category/dtos/response/category-tree.response.dto';
import { AttributeResponseDto } from './attribute.response.dto';

export class CategoryAttributeResponseDto {
    public id: string;
    public category: CategoryTreeResponseDto;
    public attribute: AttributeResponseDto;
}
