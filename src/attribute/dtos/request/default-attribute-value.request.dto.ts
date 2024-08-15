import { IsNotEmpty, IsString, IsUUID } from 'class-validator';


export class DefaultAttributeValueRequestDto {
    @IsNotEmpty()
    @IsUUID()
    public attributeId: string;

    @IsNotEmpty()
    @IsString()
    public value: string;
}