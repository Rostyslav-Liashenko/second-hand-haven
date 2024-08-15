import { NotificationType } from '../../enums/notification-type.enum';
import { UserResponseDto } from '../../../user/dtos/response/user.response.dto';
import { NotificationRecipientResponseDto } from './notification-recipient.response.dto';
import { PriceOfferResponseDto } from '../../../price-offer/dtos/response/price-offer.response.dto';
import { ChatResponseDto } from '../../../chat/dtos/response/chat.response.dto';

export class CreateNotificationPriceOfferResponseDto {
    public id: string;
    public type: NotificationType;
    public sender: UserResponseDto;
    public priceOffer: PriceOfferResponseDto;
    public notificationRecipients: NotificationRecipientResponseDto[];
    public isRead: boolean;
    public chat?: ChatResponseDto;
}
