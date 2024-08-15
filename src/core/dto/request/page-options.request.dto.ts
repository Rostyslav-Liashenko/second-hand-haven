import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum Order {
    ASC = 'ASC',
    DESC = 'DESC'
}

export class PageOptionsRequestDto {
    @IsEnum(Order)
    @IsOptional()
    public readonly order?: Order = Order.ASC;

    @ApiPropertyOptional({
        minimum: 1,
        default: 1,
    })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    public readonly page?: number = 1;

    @ApiPropertyOptional({
        minimum: 1,
        maximum: 50,
        default: 12
    })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    @IsOptional()
    public readonly take?: number = 12;

    public get skip(): number {
        return (this.page - 1) * this.take;
    }
}