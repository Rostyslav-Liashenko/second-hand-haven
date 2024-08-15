import { PriceOfferResponseDto } from './price-offer.response.dto';
import { MessageResponseDto } from '../../../chat/dtos/response/message.response.dto';
import {
    CreateNotificationPriceOfferResponseDto
} from '../../../notification/dtos/response/create-notification-price-offer.response.dto';


export class CreatePriceOfferWithMessageAndNotificationResponseDto {
    public priceOfferResponseDto: PriceOfferResponseDto;
    public messageResponseDto: MessageResponseDto;
    public createNotificationPriceOfferResponseDto: CreateNotificationPriceOfferResponseDto;
}