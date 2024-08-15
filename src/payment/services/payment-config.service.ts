import { Injectable } from '@nestjs/common';
import { BaseService } from '../../core/services/base.service';
import { UnitOfWorkService } from '../../core/services/unit-of-work.service';
import { PaymentConfigResponseDto } from '../dtos/response/payment-config.response.dto';
import { Decimal } from 'decimal.js';
import { PaymentFeeResponseDto } from '../dtos/response/payment-fee.response.dto';
import { NotFoundException } from '../../core/exceptions/not-found.exception';
import { UpdatePaymentConfigRequestDto } from '../dtos/request/update-payment-config.request.dto';
import { PaymentConfig } from '../entities/payment-config.entity';

@Injectable()
export class PaymentConfigService extends BaseService {
    constructor(protected readonly unitOfWork: UnitOfWorkService) {
        super(unitOfWork);
    }

    public async findPaymentFee(): Promise<PaymentFeeResponseDto> {
        const paymentConfigResponseDto =  await this.findPaymentConfig();
        const { fee, aurFee } = paymentConfigResponseDto;
        const feeDecimal = new Decimal(fee);
        const aurFeeDecimal = new Decimal(aurFee);
        const totalFeeDecimal = feeDecimal.add(aurFeeDecimal);
        const totalFee = totalFeeDecimal.toNumber();

        return  {
            fee: totalFee,
        };
    }

    public async findAdminEmail(): Promise<string> {
        return await this.unitOfWork.paymentConfigRepository.findAdminEmail();
    }

    public async findPaymentConfig(): Promise<PaymentConfigResponseDto> {
        const paymentConfig = await this.unitOfWork.paymentConfigRepository.findPaymentConfig();

        if (!paymentConfig) {
            throw new NotFoundException();
        }

        return PaymentConfig.toDto(paymentConfig);
    }

    public async updatePaymentConfig(
        updatePaymentConfigRequestDto: UpdatePaymentConfigRequestDto
    ): Promise<PaymentConfigResponseDto> {
        const work = async () => {
            const paymentConfigFromDto = PaymentConfig.fromUpdatePaymentConfig(updatePaymentConfigRequestDto);
            const paymentConfigToUpdate = await this.unitOfWork.paymentConfigRepository.findPaymentConfig();

            if (!paymentConfigFromDto) {
                throw new NotFoundException();
            }

            paymentConfigToUpdate.fee = paymentConfigFromDto.fee;
            paymentConfigToUpdate.aurFee = paymentConfigFromDto.aurFee;

            const payment = await this.unitOfWork.paymentConfigRepository.save(paymentConfigToUpdate);

            return PaymentConfig.toDto(payment);
        }

        return this.unitOfWork.doWork(work);
    }
}
