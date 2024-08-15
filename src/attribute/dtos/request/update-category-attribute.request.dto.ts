import { IsArray, IsUUID } from 'class-validator';


export class UpdateCategoryAttributeRequestDto {
    @IsUUID()
    public categoryId: string

    @IsArray()
    public attributeIds: string[]
}