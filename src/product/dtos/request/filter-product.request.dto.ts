import { AttributeType } from '../../../attribute/enums/attribute-type.enum';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class AttributeValueFilterRequestDto {
    @IsNotEmpty()
    @IsUUID()
    public id: string;

    @IsArray()
    @IsString({each: true})
    public values: string[];
}

export class AttributeValueSorterRequestDto {
    @IsNotEmpty()
    @IsUUID()
    public id: string;

    @IsNotEmpty()
    @IsEnum(AttributeType)
    public type: AttributeType;
}

export class FilterPriceRangeRequestDto {
    @IsNotEmpty()
    @IsNumber()
    public min: number;

    @IsNotEmpty()
    @IsNumber()
    public max: number;
}

export class AttributeValueNumberFilterRequestDto {
    @IsNotEmpty()
    @IsUUID()
    public id: string

    @IsNotEmpty()
    @IsNumber()
    public min: number;

    @IsNotEmpty()
    @IsNumber()
    public max: number;
}

export class FilterSearchRequestDto {
    @IsNotEmpty()
    @IsString()
    public searchQuery: string;
}

export class FilterProductRequestDto {
    @IsArray()
    @Type(() => AttributeValueFilterRequestDto)
    public filters: AttributeValueFilterRequestDto[];

    @IsArray()
    @Type(() => AttributeValueSorterRequestDto)
    public sorting: AttributeValueSorterRequestDto[];

    @IsArray()
    @Type(() => AttributeValueNumberFilterRequestDto)
    public numberFilters: AttributeValueNumberFilterRequestDto[];

    @IsOptional()
    public priceFilter?: FilterPriceRangeRequestDto;

    @IsOptional()
    public searchFilter: FilterSearchRequestDto;
}
