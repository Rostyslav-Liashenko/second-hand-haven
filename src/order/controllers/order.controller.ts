import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { CreateOrderRequestDto } from '../dtos/request/create-order.request.dto';
import { OrderService } from '../services/order.service';
import { CreateOrderResponseDto } from '../dtos/response/create-order.response.dto';
import { UpdateOrderRequestDto } from '../dtos/request/update-order.request.dto';
import { OrderResponseDto } from '../dtos/response/order.response.dto';
import { SameUser } from '../../core/decorators/same-user.decorator';
import { RequestObjectType } from '../../core/enums/request-object-type.enum';
import { SystemRoles } from '../../core/decorators/system-roles.decorator';
import { SystemRole } from '../../core/enums/system-role.enum';
import { OrGuard } from '@nest-lab/or-guard';
import { SystemRoleGuard } from '../../core/guards/system-role.guard';
import { SameUserGuard } from '../../core/guards/same-user.guard';
import { UpdateOrderStatusBuyerGuard } from '../guards/update-order-status-buyer.guard';
import { UpdateOrderStatusSellerGuard } from '../guards/update-order-status-seller.guard';
import { EmailConfirmGuard } from '../../core/guards/email-confirm.guard';
import { OrderShippingInfoResponseDto } from '../dtos/response/order-shipping-info.response.dto';
import { SellerGuard } from '../guards/seller.guard';
import { PageResponseDto } from '../../core/dto/response/page.response.dto';
import { PageOptionsRequestDto } from '../../core/dto/request/page-options.request.dto';
import { BuyerGuard } from '../guards/buyer.guard';
import { UpdateOrderTrackerRequestDto } from '../dtos/request/update-order-tracker.request.dto';

@ApiTags('orders')
@Controller('orders')
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @SystemRoles(SystemRole.ADMIN)
    @UseGuards(SystemRoleGuard)
    @Get()
    public async find(@Query() pageOptionsDto: PageOptionsRequestDto): Promise<PageResponseDto<OrderResponseDto>> {
        return this.orderService.findAll(pageOptionsDto);
    }

    @SystemRoles(SystemRole.ADMIN)
    @UseGuards(SystemRoleGuard)
    @Get(':id')
    public async findById(@Param('id') id: string): Promise<OrderResponseDto> {
        return this.orderService.findById(id);
    }

    @SystemRoles(SystemRole.ADMIN)
    @SameUser({
        requestObjectType: RequestObjectType.PARAM
    })
    @UseGuards(OrGuard([SystemRoleGuard, SameUserGuard]))
    @Get('buyer/:id')
    public async findByBuyerId(@Param('id') buyerId: string): Promise<OrderResponseDto[]> {
        return this.orderService.findByBuyerId(buyerId);
    }

    @SystemRoles(SystemRole.ADMIN)
    @SameUser({
        requestObjectType: RequestObjectType.PARAM
    })
    @UseGuards(OrGuard([SystemRoleGuard, SameUserGuard]))
    @Get('seller/:id')
    public async findBySellerId(
        @Param('id') sellerId: string,
    ): Promise<OrderResponseDto[]> {
        return this.orderService.findBySellerId(sellerId);
    }

    @SystemRoles(SystemRole.ADMIN)
    @UseGuards(OrGuard([SystemRoleGuard, SellerGuard]))
    @Get(':id/shipping-info')
    public async findShippingInfoByOrderId(@Param('id') orderId: string): Promise<OrderShippingInfoResponseDto> {
        return this.orderService.findShippingInfoByOrderId(orderId);
    }

    @SystemRoles(SystemRole.ADMIN)
    @UseGuards(OrGuard([SystemRoleGuard, BuyerGuard]), EmailConfirmGuard)
    @Post()
    public async create(@Body() createOrderRequestDto: CreateOrderRequestDto): Promise<CreateOrderResponseDto[]> {
        return this.orderService.create(createOrderRequestDto);
    }

    @SystemRoles(SystemRole.ADMIN)
    @UseGuards(SystemRoleGuard)
    @Put(':id')
    public async update(
        @Param('id') id: string,
        @Body() updateOrderRequest: UpdateOrderRequestDto
    ): Promise<OrderResponseDto> {
        return this.orderService.update(id, updateOrderRequest);
    }

    @Put(':id/buyer')
    @UseGuards(UpdateOrderStatusBuyerGuard, EmailConfirmGuard)
    public async buyerUpdate(
        @Request() req,
        @Param('id') id: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        @Body() updateOrderRequest: UpdateOrderRequestDto,
    ): Promise<OrderResponseDto> {
        const verifyUpdateOrder: UpdateOrderRequestDto = req.updateOrderDto;

        return this.orderService.update(id, verifyUpdateOrder);
    }

    @Put(':id/seller')
    @UseGuards(UpdateOrderStatusSellerGuard, EmailConfirmGuard)
    public async sellerUpdate(
        @Request() req,
        @Param('id') id: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        @Body() updateOrderRequest: UpdateOrderRequestDto,
    ): Promise<OrderResponseDto> {
        const verifyUpdateOrder: UpdateOrderRequestDto = req.updateOrderDto;

        return this.orderService.update(id, verifyUpdateOrder);
    }

    @Put(':id/tracker')
    @UseGuards(EmailConfirmGuard)
    public async trackerUpdate(
        @Param('id') id: string,
        @Body() updateOrderTrackerRequestDto: UpdateOrderTrackerRequestDto,
    ): Promise<OrderResponseDto> {
        return this.orderService.updateTracker(id, updateOrderTrackerRequestDto);
    }
}
