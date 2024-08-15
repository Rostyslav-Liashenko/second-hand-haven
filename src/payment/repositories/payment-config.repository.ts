import { CustomRepository } from '../../typeorm-ex/typeorm-ex.decorator';
import { PaymentConfig } from '../entities/payment-config.entity';
import { BaseRepository } from '../../core/repositories/base.repository';


@CustomRepository(PaymentConfig)
export class PaymentConfigRepository extends BaseRepository<PaymentConfig> {
    public async findPaymentConfig(): Promise<PaymentConfig> {
        const paymentConfigs = await this.find();

        return paymentConfigs[0];
    }

    public async findAdminEmail(): Promise<string> {
        const paymentsConfigs = await this.find();

        return paymentsConfigs[0].adminEmail;
    }
}
