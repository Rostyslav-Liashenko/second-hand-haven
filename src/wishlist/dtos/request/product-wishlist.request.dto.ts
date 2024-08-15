import { IsNotEmpty, IsUUID } from 'class-validator';

export class ProductWishlistRequestDto {
    @IsNotEmpty()
    @IsUUID()
    public userId: string;

    @IsNotEmpty()
    @IsUUID()
    public productId: string;
}