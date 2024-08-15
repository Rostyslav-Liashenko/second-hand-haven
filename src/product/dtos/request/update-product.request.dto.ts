import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { IdValuesRequestDto } from '../../../core/dto/request/id-values.request.dto';

export class UpdateProductRequestDto {
    @IsNotEmpty()
    @IsString()
    public name: string;

    @IsNotEmpty()
    @IsNumber()
    public price: number;

    @IsOptional()
    @IsNumber()
    public reservedPrice: number;

    @IsNotEmpty()
    @IsUUID()
    public ownerId: string;

    @IsNotEmpty()
    @IsString()
    public description: string;

    @IsNotEmpty()
    @IsUUID()
    public categoryId: string;

    @IsArray()
    @Type(() => IdValuesRequestDto)
    public attributeIdValues: IdValuesRequestDto[];
}
