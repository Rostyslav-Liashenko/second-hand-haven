import { IsNotEmpty, IsUUID } from 'class-validator';

export class ProductCartRequestDto {
    @IsNotEmpty()
    @IsUUID()
    public userId: string;

    @IsNotEmpty()
    @IsUUID()
    public productId: string;
}