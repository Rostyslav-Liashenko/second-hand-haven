import { LiqPayAction } from 'src/payment/enums/liqpay-action.enum';
import { LiqPayCurrency } from 'src/payment/enums/liqpay-currency.enum';

export class LiqPayInitPaymentRequestDto {
    public public_key: string;
    public version: string;
    public action: LiqPayAction;
    public amount: number;
    public currency: LiqPayCurrency;
    public description: string;
    public order_id: string;
    public card: string;
    public card_exp_month: string;
    public card_exp_year: string;
    public card_cvv: string;
}
