import { IsNotEmpty } from 'class-validator';

export class UpdatePaymentConfigRequestDto {
    @IsNotEmpty()
    public fee: number;

    @IsNotEmpty()
    public aurFee: number;
}
