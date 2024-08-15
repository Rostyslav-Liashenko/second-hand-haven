import { ProductResponseDto } from '../../../product/dtos/response/product.response.dto';


export class OrderProductResponseDto {
    public product: ProductResponseDto
    public price: number
}
