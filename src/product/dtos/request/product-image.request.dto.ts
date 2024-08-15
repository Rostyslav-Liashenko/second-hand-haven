import { IsNotEmpty, IsString } from 'class-validator';


export class ProductImageRequestDto {
    @IsNotEmpty()
    @IsString()
    public image: string;
}
