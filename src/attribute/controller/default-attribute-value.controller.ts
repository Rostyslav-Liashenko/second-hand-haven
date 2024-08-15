import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { DefaultAttributeValueResponseDto } from '../dtos/response/default-attribute-value.response.dto';
import { DefaultAttributeValueService } from '../services/default-attribute-value.service';
import { AllowUnauthorized } from '../../auth/decorators/allow-unauthorized.decorator';
import { DefaultAttributeValueRequestDto } from '../dtos/request/default-attribute-value.request.dto';
import { AttributeResponseDto } from '../dtos/response/attribute.response.dto';
import { UpdateDefaultAttributeValueRequestDto } from '../dtos/request/update-default-attribute-value.request.dto';
import { SystemRole } from '../../core/enums/system-role.enum';
import { SystemRoles } from '../../core/decorators/system-roles.decorator';
import { SystemRoleGuard } from '../../core/guards/system-role.guard';
import {
    UpdateManyDefaultAttributeValueRequestDto
} from '../dtos/request/update-many-default-attribute.value.request.dto';

@ApiTags('default-attribute-values')
@Controller('default-attribute-values')
export class DefaultAttributeValueController {
    constructor(
        private readonly defaultAttributeValueService: DefaultAttributeValueService
    ) {}

    @AllowUnauthorized()
    @Get('attribute/:attributeId')
    public async findByAttributeId(
        @Param('attributeId') attributeId: string
    ): Promise<DefaultAttributeValueResponseDto[]> {
        return this.defaultAttributeValueService.findByAttributeId(attributeId);
    }

    @AllowUnauthorized()
    @Get('category/:categoryId')
    public async findByCategoryId(
        @Param('categoryId') categoryId: string
    ): Promise<AttributeResponseDto[]> {
        return this.defaultAttributeValueService.findByCategoryId(categoryId);
    }

    @AllowUnauthorized()
    @Post()
    public async create(
        @Body() defaultAttributeValueDto: DefaultAttributeValueRequestDto
    ): Promise<DefaultAttributeValueResponseDto> {
        return this.defaultAttributeValueService.create(defaultAttributeValueDto);
    }

    @SystemRoles(SystemRole.ADMIN)
    @UseGuards(SystemRoleGuard)
    @Put()
    public async updateMany(
        @Body() updateManyDefaultAttributeValueRequestDto: UpdateManyDefaultAttributeValueRequestDto
    ): Promise<DefaultAttributeValueResponseDto[]> {
        return this.defaultAttributeValueService.updateMany(updateManyDefaultAttributeValueRequestDto);
    }

    @SystemRoles(SystemRole.ADMIN)
    @UseGuards(SystemRoleGuard)
    @Put(':id')
    public async update(
        @Param('id') id: string,
        @Body() updateDefaultAttributeValueRequestDto: UpdateDefaultAttributeValueRequestDto
    ): Promise<DefaultAttributeValueResponseDto> {
        return this.defaultAttributeValueService.update(id, updateDefaultAttributeValueRequestDto);
    }


    @SystemRoles(SystemRole.ADMIN)
    @UseGuards(SystemRoleGuard)
    @Delete(':id')
    public async delete(@Param('id') id: string): Promise<void> {
        return this.defaultAttributeValueService.delete(id);
    }
}
