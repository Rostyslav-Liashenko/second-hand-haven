import { IsNotEmpty, IsUUID } from 'class-validator';


export class CategoryAttributeRequestDto {
    @IsNotEmpty()
    @IsUUID()
    public categoryId: string;

    @IsNotEmpty()
    @IsUUID()
    public attributeId: string;
}