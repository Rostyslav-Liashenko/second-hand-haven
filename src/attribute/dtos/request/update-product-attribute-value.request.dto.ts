import { IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class UpdateProductAttributeValueRequestDto {
    @IsNotEmpty()
    @IsUUID()
    public productId: string;

    @IsArray()
    @IsString({each: true})
    public values: string[];
}
