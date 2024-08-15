import { AttributeType } from '../../enums/attribute-type.enum';
import { MaxMinRangeDto } from '../request/max-min-range.dto';

export class UpdateAttributeResponseDto {
    public id: string;
    public name: string;
    public type: AttributeType;
    public isSortable: boolean;
    public isFilterable: boolean;
    public isRequired: boolean;
    public meta?: MaxMinRangeDto;
}