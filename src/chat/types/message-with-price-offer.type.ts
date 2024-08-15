import { Message } from '../entities/message.entity';
import { PriceOffer } from '../../price-offer/entities/price-offer.entity';

export type MessageWithPriceOffer = Message & {
    priceOffer: PriceOffer
}
