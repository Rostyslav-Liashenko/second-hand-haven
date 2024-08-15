import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class SubcategoryRequestDto {
    @IsNotEmpty()
    @IsUUID()
    public parentId: string;

    @IsNotEmpty()
    @IsString()
    public name: string;
}