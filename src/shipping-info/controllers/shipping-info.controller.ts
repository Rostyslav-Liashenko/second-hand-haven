import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, Delete, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ShippingInfoService } from '../services/shipping-info.service';
import { ShippingInfoResponseDto } from '../dtos/response/shipping-info.response.dto';
import { UpdateShippingInfoRequestDto } from '../dtos/request/update-shipping-info.request.dto';
import { SystemRoles } from '../../core/decorators/system-roles.decorator';
import { SystemRole } from '../../core/enums/system-role.enum';
import { SameUser } from '../../core/decorators/same-user.decorator';
import { RequestObjectType } from '../../core/enums/request-object-type.enum';
import { OrGuard } from '@nest-lab/or-guard';
import { SystemRoleGuard } from '../../core/guards/system-role.guard';
import { SameUserGuard } from '../../core/guards/same-user.guard';

@ApiTags('shipping-info')
@Controller('shipping-info')
export class ShippingInfoController {
    constructor(private readonly shippingInfoService: ShippingInfoService) {}

    @Get('user/:id')
    @SystemRoles(SystemRole.ADMIN)
    @SameUser({
        requestObjectType: RequestObjectType.PARAM
    })
    @UseGuards(OrGuard([SystemRoleGuard, SameUserGuard]))
    public async getByUserId(@Param('id') userId: string): Promise<ShippingInfoResponseDto> {
        return this.shippingInfoService.findByUserId(userId);
    }

    @Put('user/:id')
    @SystemRoles(SystemRole.ADMIN)
    @SameUser({
        requestObjectType: RequestObjectType.PARAM
    })
    @UseGuards(OrGuard([SystemRoleGuard, SameUserGuard]))
    public async updateByUserId(
        @Param('id') userId: string,
        @Body() updateShippingInfo: UpdateShippingInfoRequestDto
    ): Promise<ShippingInfoResponseDto> {
        return this.shippingInfoService.updateByUserId(userId, updateShippingInfo);
    }

    @Delete('user/:id')
    @SystemRoles(SystemRole.ADMIN)
    @SameUser({
        requestObjectType: RequestObjectType.PARAM
    })
    @UseGuards(OrGuard([SystemRoleGuard, SameUserGuard]))
    public async clearByUserId(@Param('id') userId: string): Promise<void> {
        return this.shippingInfoService.clearByUserId(userId);
    }
}