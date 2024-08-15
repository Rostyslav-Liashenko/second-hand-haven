import { Product } from '../../entities/product.entity';

export class OwnerProductResponseDto {
    public ownerId: string;
    public products: Product[];
}
