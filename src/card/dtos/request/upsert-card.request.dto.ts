import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpsertCardRequestDto {
    @IsString()
    @MaxLength(24)
    @MinLength(16)
    public number: string;

    @IsString()
    @MinLength(3)
    @MaxLength(3)
    public cvv: string;

    @IsString()
    @MinLength(2)
    @MaxLength(2)
    public expireYear: string;

    @IsString()
    @MinLength(2)
    @MaxLength(2)
    public expireMonth: string;
}
