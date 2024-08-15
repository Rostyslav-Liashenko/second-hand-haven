import { IsArray, IsUUID } from 'class-validator';


export class UpdateManyDefaultAttributeValueRequestDto {
    @IsUUID()
    public attributeId: string;

    @IsArray()
    public defaultValues: string[];
}
