import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AttributeRequestDto } from '../dtos/request/attribute.request.dto';
import { AttributeService } from '../services/attribute.service';
import { AllowUnauthorized } from '../../auth/decorators/allow-unauthorized.decorator';
import { AttributeResponseDto } from '../dtos/response/attribute.response.dto';
import { UpdateAttributeRequestDto } from '../dtos/request/update-attribute.request.dto';
import { UpdateAttributeResponseDto } from '../dtos/response/update-attribute.response.dto';
import { SystemRole } from '../../core/enums/system-role.enum';
import { SystemRoles } from '../../core/decorators/system-roles.decorator';
import { SystemRoleGuard } from '../../core/guards/system-role.guard';

@ApiTags('attributes')
@Controller('attributes')
export class AttributeController {
    constructor(private readonly attributeService: AttributeService) {}

    @AllowUnauthorized()
    @Get()
    public async findAll(): Promise<AttributeResponseDto[]> {
        return this.attributeService.findAll();
    }

    @AllowUnauthorized()
    @Get(':id')
    public async findById(@Param('id') attributeId: string): Promise<AttributeResponseDto> {
        return this.attributeService.findById(attributeId);
    }

    @AllowUnauthorized()
    @Get('/category/:categoryId')
    public async findByCategoryId(@Param('categoryId') categoryId: string): Promise<AttributeResponseDto[]> {
        return this.attributeService.findByCategoryId(categoryId);
    }

    @AllowUnauthorized()
    @Get('/product/:productId')
    public async findByProductId(@Param('productId') productId: string): Promise<AttributeResponseDto[]> {
        return this.attributeService.findByProductId(productId);
    }

    @SystemRoles(SystemRole.ADMIN)
    @UseGuards(SystemRoleGuard)
    @Post()
    public async create(@Body() attributeRequestDto: AttributeRequestDto): Promise<AttributeResponseDto> {
        return this.attributeService.create(attributeRequestDto);
    }

    @SystemRoles(SystemRole.ADMIN)
    @UseGuards(SystemRoleGuard)
    @Put(':id')
    public async update(
        @Param('id') id: string,
        @Body() attributeUpdateDto: UpdateAttributeRequestDto
    ): Promise<UpdateAttributeResponseDto> {
        return this.attributeService.update(id, attributeUpdateDto);
    }

    @SystemRoles(SystemRole.ADMIN)
    @UseGuards(SystemRoleGuard)
    @Delete(':id')
    public async softDeleteById(@Param('id') id: string): Promise<void> {
        return this.attributeService.softDeleteByAttributeId(id);
    }
}
