import { ProductResponseDto } from './product.response.dto';


export class ProductWithStatisticResponseDto {
    public product: ProductResponseDto;
    public countChats: number;
    public countLikes: number;
    public countView: number;
}
