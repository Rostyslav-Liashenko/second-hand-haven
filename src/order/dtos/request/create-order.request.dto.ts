import { IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateOrderRequestDto {
    @IsNotEmpty()
    @IsUUID()
    public buyerId: string;

    @IsArray()
    @IsString({each: true})
    public productIds: string[];

    @IsNotEmpty()
    @IsString()
    public receiverFirstName: string;

    @IsNotEmpty()
    @IsString()
    public receiverLastName: string;

    @IsNotEmpty()
    @IsString()
    public phoneNumber: string;

    @IsNotEmpty()
    @IsString()
    public addressLine: string;

    @IsNotEmpty()
    @IsString()
    public city: string;

    @IsNotEmpty()
    @IsString()
    public zipCode: string;
}
