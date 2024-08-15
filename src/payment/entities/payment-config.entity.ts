import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { UpdatePaymentConfigRequestDto } from '../dtos/request/update-payment-config.request.dto';
import { PaymentConfigResponseDto } from '../dtos/response/payment-config.response.dto';

@Entity({name: 'payment_config'})
export class PaymentConfig extends BaseEntity {

    @Column({name: 'fee', type: 'decimal', default: 0})
    public fee: number;

    @Column({name: 'aur_fee', type: 'decimal', default: 0})
    public aurFee: number;

    @Column({name: 'admin_email', type: 'varchar', default: ''})
    public adminEmail: string;


    public static fromUpdatePaymentConfig(dto: UpdatePaymentConfigRequestDto): PaymentConfig {
        const paymentConfig = new PaymentConfig();

        paymentConfig.fee = dto.fee;
        paymentConfig.aurFee = dto.aurFee;

        return paymentConfig;
    }

    public static toDto(paymentConfig: PaymentConfig): PaymentConfigResponseDto {
        return {
            fee: paymentConfig.fee,
            aurFee: paymentConfig.aurFee,
        }
    }
}
