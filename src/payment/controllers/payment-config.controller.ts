import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { PaymentConfigService } from '../services/payment-config.service';
import { PaymentFeeResponseDto } from '../dtos/response/payment-fee.response.dto';
import { PaymentConfigResponseDto } from '../dtos/response/payment-config.response.dto';
import { UpdatePaymentConfigRequestDto } from '../dtos/request/update-payment-config.request.dto';
import { SystemRoles } from '../../core/decorators/system-roles.decorator';
import { SystemRole } from '../../core/enums/system-role.enum';
import { SystemRoleGuard } from '../../core/guards/system-role.guard';

@ApiTags('payment-configs')
@Controller('payment-configs')
export class PaymentConfigController {
    constructor(private readonly paymentConfigService: PaymentConfigService) {}

    @Get('payment-fee')
    public async findPaymentFee(): Promise<PaymentFeeResponseDto> {
        return this.paymentConfigService.findPaymentFee();
    }

    @SystemRoles(SystemRole.ADMIN)
    @UseGuards(SystemRoleGuard)
    @Get()
    public async find(): Promise<PaymentConfigResponseDto> {
        return this.paymentConfigService.findPaymentConfig();
    }


    @SystemRoles(SystemRole.ADMIN)
    @UseGuards(SystemRoleGuard)
    @Put()
    public async update(
        @Body() updatePaymentConfigRequestDto: UpdatePaymentConfigRequestDto
    ): Promise<PaymentConfigResponseDto> {
        return this.paymentConfigService.updatePaymentConfig(updatePaymentConfigRequestDto);
    }
}
