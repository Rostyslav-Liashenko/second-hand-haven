import { IsNotEmpty, IsNumber } from 'class-validator';

export class MaxMinRangeDto {
    @IsNotEmpty()
    @IsNumber()
    public min: number;

    @IsNotEmpty()
    @IsNumber()
    public max: number;
}
