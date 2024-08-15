import { AttributeType } from '../../enums/attribute-type.enum';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { MaxMinRangeDto } from './max-min-range.dto';

export class AttributeRequestDto {
    @IsNotEmpty()
    @IsString()
    public name: string;

    @IsNotEmpty()
    @IsEnum(AttributeType)
    public type: AttributeType;

    @IsNotEmpty()
    @IsBoolean()
    public isSortable: boolean;

    @IsNotEmpty()
    @IsBoolean()
    public isFilterable: boolean;

    @IsNotEmpty()
    @IsBoolean()
    public isRequired: boolean;

    @IsOptional()
    public meta?: MaxMinRangeDto;

    @IsOptional()
    @IsArray()
    public defaultValues?: string[]
}
