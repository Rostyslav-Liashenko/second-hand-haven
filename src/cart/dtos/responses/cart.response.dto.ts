import { ApiProperty } from '@nestjs/swagger';
import { ProductResponseDto } from '../../../product/dtos/response/product.response.dto';

export class CartResponseDto {
    @ApiProperty()
    public products: ProductResponseDto[];

    @ApiProperty()
    public totalSum: number;
}
