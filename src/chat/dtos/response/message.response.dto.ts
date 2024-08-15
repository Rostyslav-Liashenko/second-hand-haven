import { MessageType } from '../../enums/message-type.enum';
import { PriceOfferResponseDto } from '../../../price-offer/dtos/response/price-offer.response.dto';

export class MessageResponseDto {
    public id: string;
    public chatId: string;
    public messageOwnerId: string;
    public text: string;
    public createdAt: Date;
    public type: MessageType;
    public priceOffer?: PriceOfferResponseDto
}
