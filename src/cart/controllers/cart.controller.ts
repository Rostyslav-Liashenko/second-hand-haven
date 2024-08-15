import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CartService } from '../services/cart.service';
import { ProductCartRequestDto } from '../dtos/request/product-cart.request.dto';
import { ProductCartResponseDto } from '../dtos/responses/product-cart.response.dto';
import { ProductQuantityResponseDto } from '../dtos/responses/product-quantity.response.dto';
import { CartResponseDto } from '../dtos/responses/cart.response.dto';
import { SameUser } from '../../core/decorators/same-user.decorator';
import { RequestObjectType } from '../../core/enums/request-object-type.enum';
import { OrGuard } from '@nest-lab/or-guard';
import { SystemRoleGuard } from '../../core/guards/system-role.guard';
import { SameUserGuard } from '../../core/guards/same-user.guard';
import { SystemRoles } from '../../core/decorators/system-roles.decorator';
import { SystemRole } from '../../core/enums/system-role.enum';

@ApiTags('carts')
@Controller('carts')
export class CartController {
    constructor(private readonly cartService: CartService) {}

    @Get('/user/:id')
    @SystemRoles(SystemRole.ADMIN)
    @SameUser({
        requestObjectType: RequestObjectType.PARAM
    })
    @UseGuards(OrGuard([SystemRoleGuard, SameUserGuard]))
    public async findByUserId(@Param('id') id: string): Promise<CartResponseDto> {
        return this.cartService.findByUserId(id);
    }

    @Get('/user/:id/quantity')
    @SystemRoles(SystemRole.ADMIN)
    @SameUser({
        requestObjectType: RequestObjectType.PARAM
    })
    @UseGuards(OrGuard([SystemRoleGuard, SameUserGuard]))
    public async findProductQuantityByUserId(@Param('id') id: string): Promise<ProductQuantityResponseDto> {
        return this.cartService.findProductQuantityByUserId(id);
    }

    @Post()
    @SystemRoles(SystemRole.ADMIN)
    @SameUser({
        requestObjectType: RequestObjectType.BODY
    })
    @UseGuards(OrGuard([SystemRoleGuard, SameUserGuard]))
    public async addProduct(@Body() productCartRequest: ProductCartRequestDto): Promise<ProductCartResponseDto> {
        return this.cartService.addProduct(productCartRequest);
    }

    @Delete('user/:id/product/:productId')
    @SystemRoles(SystemRole.ADMIN)
    @SameUser({
        requestObjectType: RequestObjectType.PARAM
    })
    @UseGuards(OrGuard([SystemRoleGuard, SameUserGuard]))
    public async deleteProduct(
        @Param('id') userId: string,
        @Param('productId') productId: string
    ): Promise<void> {
        return this.cartService.deleteProduct(userId, productId);
    }

    @Delete(`user/:id/owner/:ownerId`)
    @SystemRoles(SystemRole.ADMIN)
    @SameUser({
        requestObjectType: RequestObjectType.PARAM
    })
    @UseGuards(OrGuard([SystemRoleGuard, SameUserGuard]))
    public async deleteProductByUserIdAndOwnerId(
        @Param('id') userId: string,
        @Param('ownerId') ownerId: string
    ): Promise<void> {
        return this.cartService.deleteByUserIdAndOwnerId(userId, ownerId);
    }

    @SystemRoles(SystemRole.ADMIN)
    @SameUser({
        requestObjectType: RequestObjectType.PARAM
    })
    @UseGuards(OrGuard([SystemRoleGuard, SameUserGuard]))
    @Delete('user/:id')
    public async clear(@Param('id') userId: string): Promise<void> {
        return this.cartService.deleteByUserId(userId);
    }
}
