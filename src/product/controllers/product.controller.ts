import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProductService } from '../services/product.service';
import { UpdateProductRequestDto } from '../dtos/request/update-product.request.dto';
import { ProductResponseDto } from '../dtos/response/product.response.dto';
import { AllowUnauthorized } from '../../auth/decorators/allow-unauthorized.decorator';
import { PageOptionsRequestDto } from '../../core/dto/request/page-options.request.dto';
import { PageResponseDto } from '../../core/dto/response/page.response.dto';
import { QuantityLikeResponseDto } from '../dtos/response/quantity-like.response.dto';
import { ProductDetailedAttributeResponseDto } from '../dtos/response/product-detailed-attribute.response.dto';
import { FilterProductRequestDto } from '../dtos/request/filter-product.request.dto';
import { CreateProductRequestDto } from '../dtos/request/create-product.request.dto';
import { SystemRoles } from '../../core/decorators/system-roles.decorator';
import { SystemRole } from '../../core/enums/system-role.enum';
import { SameUser } from '../../core/decorators/same-user.decorator';
import { RequestObjectType } from '../../core/enums/request-object-type.enum';
import { OrGuard } from '@nest-lab/or-guard';
import { SystemRoleGuard } from '../../core/guards/system-role.guard';
import { SameUserGuard } from '../../core/guards/same-user.guard';
import { EmailConfirmGuard } from '../../core/guards/email-confirm.guard';
import { PageWithDataMetaResponseDto } from '../../core/dto/response/page-with-data-meta.response.dto';
import { TotalMaxMinPropertyResponseDto } from '../dtos/response/total-max-min-property.response.dto';
import { ProductWithStatisticResponseDto } from '../dtos/response/product-with-statistic.response.dto';
import {
    ProductDetailedAttributeBeforeUpdateResponseDto
} from '../dtos/response/product-detailed-attribute-before-update.response.dto';


@ApiTags('products')
@Controller('products')
export class ProductController {
    constructor(private readonly productService: ProductService) {}

    @AllowUnauthorized()
    @Get()
    public async find(@Query() pageOptionsDto: PageOptionsRequestDto): Promise<PageResponseDto<ProductResponseDto>> {
        return this.productService.findAll(pageOptionsDto);
    }

    @AllowUnauthorized()
    @Get(':productId/quantity-like')
    public async findQuantityLike(@Param('productId') productId :string): Promise<QuantityLikeResponseDto> {
        return this.productService.findQuantityLike(productId);
    }

    @AllowUnauthorized()
    @Get('/owner/:publicProfileId')
    public async findByUserPublicProfileId(
        @Param('publicProfileId') publicProfileId: string,
        @Query() pageOptionsDto: PageOptionsRequestDto,
    ): Promise<PageResponseDto<ProductResponseDto>> {
        return this.productService.findByUserPublicProfileId(publicProfileId, pageOptionsDto);
    }

    @Get('/authorized/owner/:publicProfileId')
    public async findByOwnerIdAuthorized(
        @Request() req,
        @Param('publicProfileId') publicProfileId: string,
        @Query() pageOptionsDto: PageOptionsRequestDto
    ): Promise<PageResponseDto<ProductResponseDto>> {
        const userId = req.user.id;

        return this.productService.findByUserPublicProfileId(publicProfileId, pageOptionsDto, userId);
    }

    @AllowUnauthorized()
    @Get('/just-arrived')
    public async findJustArrived(@Query('quantity') quantity: number): Promise<ProductResponseDto[]> {
        return this.productService.findJustArrived(quantity);
    }

    @Get('/authorized/just-arrived')
    public async findJustArrivedAuthorized(
        @Request() req,
        @Query('quantity') quantity: number
    ): Promise<ProductResponseDto[]> {
        const userId = req.user.id;

        return this.productService.findJustArrived(quantity, userId);
    }

    @AllowUnauthorized()
    @Get(':id')
    public async findOne(@Param('id') id: string): Promise<ProductDetailedAttributeResponseDto> {
        return this.productService.findById(id);
    }

    @Get(':id/full-info')
    public async findOneForUpdate(
        @Request() req,
        @Param('id') id: string
    ): Promise<ProductDetailedAttributeBeforeUpdateResponseDto> {
        const userId = req.user.id;

        return this.productService.findByIdBeforeUpdate(id, userId);
    }

    @Get('/authorized/:id')
    public async findOneAuthorize(
        @Request() req,
        @Param('id') id: string,
    ): Promise<ProductDetailedAttributeResponseDto> {
        const userId = req.user.id;

        return this.productService.findById(id, userId);
    }

    @Get('seller/:id')
    @SystemRoles(SystemRole.ADMIN)
    @SameUser({
        requestObjectType: RequestObjectType.PARAM,
    })
    @UseGuards(OrGuard([SystemRoleGuard, SameUserGuard]))
    public async findBySellerId(@Param('id') sellerId: string): Promise<ProductResponseDto[]> {
        return this.productService.findBySellerId(sellerId);
    }

    @Get('statistic/seller/:id')
    @AllowUnauthorized()
    public async findBySellerIdWithStatistic(
        @Param('id') sellerId: string
    ): Promise<ProductWithStatisticResponseDto[]> {
        return this.productService.findBySellerIdWithStatistic(sellerId);
    }

    @AllowUnauthorized()
    @Post('/category/:categoryId')
    public async findByCategoryId(
        @Param('categoryId') categoryId: string,
        @Query() pageOptionsDto: PageOptionsRequestDto,
        @Body() filterProductRequestDto: FilterProductRequestDto,
    ): Promise<PageWithDataMetaResponseDto<ProductResponseDto[], TotalMaxMinPropertyResponseDto>> {
        return this.productService.findByCategoryId(categoryId, pageOptionsDto, filterProductRequestDto);
    }

    @Post('/authorized/category/:categoryId')
    public async findByCategoryIdAuthorized(
        @Request() req,
        @Param('categoryId') categoryId: string,
        @Query() pageOptionsDto: PageOptionsRequestDto,
        @Body() filterProductRequestDto: FilterProductRequestDto,
    ): Promise<PageWithDataMetaResponseDto<ProductResponseDto[], TotalMaxMinPropertyResponseDto>> {
        const userId = req.user.id;

        return this.productService.findByCategoryId(categoryId, pageOptionsDto, filterProductRequestDto, userId);
    }

    @Post('/create')
    @SystemRoles(SystemRole.ADMIN)
    @SameUser({
        requestObjectType: RequestObjectType.BODY_USER_OWNER_ID
    })
    @UseGuards(OrGuard([SystemRoleGuard, SameUserGuard]), EmailConfirmGuard)
    public async create(
        @Body() createProductRequestDto: CreateProductRequestDto
    ): Promise<ProductResponseDto> {
        return this.productService.create(createProductRequestDto);
    }

    @Put(':id')
    @SystemRoles(SystemRole.ADMIN)
    @SameUser({
        requestObjectType: RequestObjectType.BODY_USER_OWNER_ID
    })
    @UseGuards(OrGuard([SystemRoleGuard, SameUserGuard]))
    public async update(
        @Param('id') id: string,
        @Body() updateProductRequestDto: UpdateProductRequestDto
    ): Promise<ProductResponseDto> {
        return this.productService.update(id, updateProductRequestDto);
    }

    @Put(':id/count-view')
    @AllowUnauthorized()
    public async updateCountView(@Param('id') productId: string): Promise<void> {
        return this.productService.updateCountView(productId);
    }

    @Delete(':id')
    public async delete(@Param('id') id: string): Promise<void> {
        return this.productService.delete(id);
    }
}
