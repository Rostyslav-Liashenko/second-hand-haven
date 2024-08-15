import { PriceOffer } from '../../price-offer/entities/price-offer.entity';
import { Message } from '../../chat/entities/message.entity';
import { Notification } from '../entities/notification.entity';


export type NotificationWithPriceOffer = Notification & {
    productOffer: PriceOffer,
    message: Message
}
