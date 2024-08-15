import { PriceOfferStatus } from '../../enums/price-offer-status.enum';


export class UpdatePriceOfferRequestDto {
    public productId: string;
    public buyerId: string;
    public status: PriceOfferStatus;
}
