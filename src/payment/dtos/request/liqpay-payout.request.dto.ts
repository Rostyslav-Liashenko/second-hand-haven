import { LiqPayAction } from 'src/payment/enums/liqpay-action.enum';
import { LiqPayCurrency } from 'src/payment/enums/liqpay-currency.enum';

export class LiqPayPayoutRequestDto {
    public version: string;
    public public_key: string;
    public action: LiqPayAction;
    public amount: number;
    public currency: LiqPayCurrency;
    public description: string;
    public order_id: string;
    public receiver_card: string;
}
