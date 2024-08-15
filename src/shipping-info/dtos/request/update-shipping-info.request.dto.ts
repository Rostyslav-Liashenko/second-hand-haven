import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateShippingInfoRequestDto {

    @IsNotEmpty()
    @IsString()
    @MaxLength(1000)
    public addressLine: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(500)
    public city: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(10)
    public zipCode: string;
}