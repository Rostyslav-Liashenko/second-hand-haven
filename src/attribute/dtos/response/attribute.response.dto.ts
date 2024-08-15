import { AttributeType } from '../../enums/attribute-type.enum';
import { MaxMinRangeDto } from '../request/max-min-range.dto';

export class AttributeResponseDto {
    public id: string;
    public name: string;
    public type: AttributeType;
    public isSortable: boolean;
    public isFilterable: boolean;
    public isRequired: boolean;
    public values: string[];
    public meta?: MaxMinRangeDto;
}
