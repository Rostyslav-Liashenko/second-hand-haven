import { IsUUID } from 'class-validator';


export class CreateNotificationPriceOfferRequestDto {
    @IsUUID()
    public senderId: string;

    @IsUUID()
    public priceOfferId: string;

    @IsUUID()
    public recipientId: string;
}
