import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { CategoryAttributeService } from '../services/category-attribute.service';
import { SystemRoles } from '../../core/decorators/system-roles.decorator';
import { SystemRole } from '../../core/enums/system-role.enum';
import { SystemRoleGuard } from '../../core/guards/system-role.guard';
import { UpdateCategoryAttributeRequestDto } from '../dtos/request/update-category-attribute.request.dto';
import { CategoryAttributeResponseDto } from '../dtos/response/category-attribute.response.dto';


@ApiTags('category-attributes')
@Controller('category-attributes')
export class CategoryAttributeController {
    constructor(private categoryAttributeService: CategoryAttributeService) {}

    @SystemRoles(SystemRole.ADMIN)
    @UseGuards(SystemRoleGuard)
    @Get('category/:categoryId')
    public async findByCategoryId(
        @Param('categoryId') categoryId: string
    ): Promise<CategoryAttributeResponseDto[]> {
        return this.categoryAttributeService.findByCategoryId(categoryId);
    }

    @SystemRoles(SystemRole.ADMIN)
    @UseGuards(SystemRoleGuard)
    @Put()
    public async update(@Body() updateCategoryRequestDto: UpdateCategoryAttributeRequestDto): Promise<void> {
        return this.categoryAttributeService.update(updateCategoryRequestDto);
    }
}
