import { IsNumber, IsString, IsUUID } from 'class-validator';

export class LiqPayPayment {
    @IsNumber()
    public amount: number;

    @IsUUID()
    public orderId: string;

    @IsString()
    public description: string;
}
