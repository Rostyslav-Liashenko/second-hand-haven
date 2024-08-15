import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateDefaultAttributeValueRequestDto {
    @IsNotEmpty()
    @IsString()
    public value: string;
}