import { IsNotEmpty, IsString } from 'class-validator';

export class CategoryRequestDto {
    @IsNotEmpty()
    @IsString()
    public name: string;
}