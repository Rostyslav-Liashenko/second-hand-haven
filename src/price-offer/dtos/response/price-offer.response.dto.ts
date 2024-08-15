import { PriceOfferStatus } from '../../enums/price-offer-status.enum';

export class PriceOfferResponseDto {
    public id: string;
    public productId: string;
    public buyerId: string;
    public price: number;
    public status: PriceOfferStatus;
}
