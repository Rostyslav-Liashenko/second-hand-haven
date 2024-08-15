import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { WishlistService } from '../services/wishlist.service';
import { ProductResponseDto } from '../../product/dtos/response/product.response.dto';
import { ProductWishlistRequestDto } from '../dtos/request/product-wishlist.request.dto';
import { ProductWishlistResponseDto } from '../dtos/response/product-wishlist.response.dto';
import { SameUserGuard } from '../../core/guards/same-user.guard';
import { SystemRole } from '../../core/enums/system-role.enum';
import { SystemRoles } from '../../core/decorators/system-roles.decorator';
import { SameUser } from '../../core/decorators/same-user.decorator';
import { RequestObjectType } from '../../core/enums/request-object-type.enum';
import { OrGuard } from '@nest-lab/or-guard';
import { SystemRoleGuard } from '../../core/guards/system-role.guard';

@ApiTags('wishlists')
@Controller('wishlists')
export class WishlistController {
    constructor(private readonly wishlistService: WishlistService) {}

    @Get('user/:id')
    @SystemRoles(SystemRole.ADMIN)
    @SameUser({
        requestObjectType: RequestObjectType.PARAM
    })
    @UseGuards(OrGuard([SystemRoleGuard, SameUserGuard]))
    public async findByUserId(@Param('id') id: string): Promise<ProductResponseDto[]> {
        return this.wishlistService.findByUserId(id);
    }

    @Post()
    @SystemRoles(SystemRole.ADMIN)
    @SameUser({
        requestObjectType: RequestObjectType.BODY
    })
    @UseGuards(OrGuard([SystemRoleGuard, SameUserGuard]))
    public async addProduct(
        @Body() productWishlistRequest: ProductWishlistRequestDto
    ): Promise<ProductWishlistResponseDto> {
        return this.wishlistService.addProduct(productWishlistRequest);
    }

    @Delete()
    @SystemRoles(SystemRole.ADMIN)
    @SameUser({
        requestObjectType: RequestObjectType.BODY
    })
    @UseGuards(OrGuard([SystemRoleGuard, SameUserGuard]))
    public async deleteProduct(@Body() productWishlistRequest: ProductWishlistRequestDto): Promise<void> {
        return this.wishlistService.deleteProduct(productWishlistRequest);
    }
}
