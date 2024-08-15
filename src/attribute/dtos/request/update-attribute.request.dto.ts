import { AttributeType } from '../../enums/attribute-type.enum';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { MaxMinRangeDto } from './max-min-range.dto';

export class UpdateAttributeRequestDto {
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
    public isRequired: boolean;

    @IsOptional()
    public meta?: MaxMinRangeDto;

    @IsNotEmpty()
    @IsBoolean()
    public isFilterable: boolean;
}