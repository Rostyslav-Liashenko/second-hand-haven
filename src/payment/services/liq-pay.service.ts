import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/core/services/base.service';
import { UnitOfWorkService } from 'src/core/services/unit-of-work.service';
import { LiqPayInitPaymentRequestDto } from '../dtos/request/liqpay-init-payment.request.dto';
import { CryptoService } from 'src/core/services/crypto.service';
import { LiqPayPayment } from '../dtos/request/liqpay-payment.request.dto';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';
import { LiqPayPayoutRequestDto } from '../dtos/request/liqpay-payout.request.dto';
import { LiqPayCurrency } from '../enums/liqpay-currency.enum';
import { LiqPayAction } from '../enums/liqpay-action.enum';

@Injectable()
export class LiqPayService extends BaseService {
    private readonly privateKey: string;
    private readonly publicKey: string;
    private readonly baseUrl: string;
    private readonly config: AxiosRequestConfig;
    private readonly versionApi: string;

    constructor(
        protected readonly unitOfWork: UnitOfWorkService,
        private readonly cryptoService: CryptoService,
        private readonly httpService: HttpService,
    ) {
        super(unitOfWork);
        this.publicKey = process.env.LIQPAY_PUBLIC_KEY;
        this.privateKey = process.env.LIQPAY_PRIVATE_KEY;
        this.baseUrl = process.env.LIQPAY_BASE_URL;
        this.versionApi = '3';

        this.config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        };
    }

    public async checkout(createPayment: LiqPayPayment): Promise<void> {
        const initPayment: LiqPayInitPaymentRequestDto = {
            public_key: this.publicKey,
            version: this.versionApi,
            action: LiqPayAction.PAY,
            amount: createPayment.amount,
            currency: LiqPayCurrency.UAH,
            description: createPayment.description,
            order_id: createPayment.orderId,
            card: process.env.LIQPAY_TEST_CARD_NUMBER,
            card_exp_month: process.env.LIQPAY_TEST_EXP_MONTH,
            card_exp_year: process.env.LIQPAY_TEST_EXP_YEAR,
            card_cvv: process.env.LIQPAY_TEST_CVV,
        };

        await this.executeRequest<LiqPayInitPaymentRequestDto>(initPayment);
    }

    public async payout(createPayment: LiqPayPayment): Promise<void> {
        const payoutPayment: LiqPayPayoutRequestDto = {
            version: this.versionApi,
            public_key: this.publicKey,
            action: LiqPayAction.P2PCREDIT,
            amount: createPayment.amount,
            currency: LiqPayCurrency.UAH,
            description: createPayment.description,
            order_id: createPayment.orderId + '_without',
            receiver_card: process.env.LIQPAY_TEST_CARD_NUMBER,
        };

        await this.executeRequest<LiqPayPayoutRequestDto>(payoutPayment);
    }

    private getToken(dto: any): string {
        const jsonString = JSON.stringify(dto);

        return this.cryptoService.toBase64(jsonString);
    }

    private getSignature(dto: any): string {
        const token = this.getToken(dto);
        const sign = this.privateKey + token + this.privateKey;
        const hash = this.cryptoService.getHashBySha1(sign);

        return hash;
    }

    private async executeRequest<T>(dto: T): Promise<void> {
        const token = this.getToken(dto);
        const signature = this.getSignature(dto);

        const body = new URLSearchParams({
            data: token,
            signature,
        });

        const response$ = this.httpService.post(this.baseUrl, body, this.config);
        await lastValueFrom(response$);
    }
}