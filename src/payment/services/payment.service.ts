import { LiqPayService } from './liq-pay.service';
import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/core/services/base.service';
import { UnitOfWorkService } from 'src/core/services/unit-of-work.service';
import { LiqPayPayment } from '../dtos/request/liqpay-payment.request.dto';

@Injectable()
export class PaymentService extends BaseService {
    constructor(
        protected readonly unitOfWork: UnitOfWorkService,
        private readonly LiqPayService: LiqPayService,
    ) {
        super(unitOfWork);
    }

    public async checkout(orderId: string, amount: number, description: string): Promise<void> {
        const liqPayment: LiqPayPayment = {
            orderId,
            amount,
            description,
        };

        await this.LiqPayService.checkout(liqPayment);
    }

    public async payouts(orderId: string, amount: number, description: string): Promise<void> {
        const liqPayment: LiqPayPayment = {
            orderId,
            amount,
            description,
        };

        await this.LiqPayService.payout(liqPayment);
    }
}