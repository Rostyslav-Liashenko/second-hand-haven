import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CategoryService } from '../services/category.service';
import { AllowUnauthorized } from '../../auth/decorators/allow-unauthorized.decorator';
import { CategoryRequestDto } from '../dtos/request/category.request.dto';
import { SubcategoryRequestDto } from '../dtos/request/subcategory.request.dto';
import { CategoryTreeResponseDto } from '../dtos/response/category-tree.response.dto';
import { AdjacentCategoryRequestDto } from '../dtos/request/adjacent-category-request.dto';
import { SystemRoleGuard } from '../../core/guards/system-role.guard';
import { SystemRole } from '../../core/enums/system-role.enum';
import { SystemRoles } from '../../core/decorators/system-roles.decorator';

@ApiTags('categories')
@Controller('categories')
@UseGuards(SystemRoleGuard)
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    @AllowUnauthorized()
    @Get()
    public async find(): Promise<CategoryTreeResponseDto[]> {
        return await this.categoryService.findTreeCategories();
    }

    @AllowUnauthorized()
    @Get(':categoryId')
    public async findById(@Param('categoryId') categoryId: string): Promise<CategoryTreeResponseDto> {
        return await this.categoryService.findById(categoryId);
    }

    @AllowUnauthorized()
    @Get(':categoryId/sub-category')
    public async findSubcategory(@Param('categoryId') categoryId: string): Promise<CategoryTreeResponseDto[]> {
        return await this.categoryService.findFlatSubcategories(categoryId);
    }

    @AllowUnauthorized()
    @Get('depth/:depth')
    public async findByDepth(@Param('depth') depth: number): Promise<CategoryTreeResponseDto[]> {
        return await this.categoryService.findSubtreeByDepth(depth);
    }

    @AllowUnauthorized()
    @Get('attribute/:attributeId')
    public async findByAttributeId(
        @Param('attributeId') attributeId: string
    ): Promise<CategoryTreeResponseDto[]> {
        return this.categoryService.findCategoriesByAttributeId(attributeId);
    }

    @SystemRoles(SystemRole.ADMIN)
    @Post()
    public async create(@Body() categoryRequest: CategoryRequestDto): Promise<CategoryTreeResponseDto> {
        return this.categoryService.create(categoryRequest);
    }

    @SystemRoles(SystemRole.ADMIN)
    @Put(':categoryId')
    public async update(
        @Param('categoryId') categoryId: string,
        @Body() categoryRequest: CategoryRequestDto
    ): Promise<CategoryTreeResponseDto> {
        return this.categoryService.update(categoryId, categoryRequest);
    }

    @SystemRoles(SystemRole.ADMIN)
    @Post('/sub-category')
    public async createSubcategory(
        @Body() subCategoryRequest: SubcategoryRequestDto
    ): Promise<CategoryTreeResponseDto> {
        return this.categoryService.createSubcategory(subCategoryRequest);
    }

    @SystemRoles(SystemRole.ADMIN)
    @Post('/adjacent')
    public async createAdjacent(
        @Body() subCategoryRequest: AdjacentCategoryRequestDto
    ): Promise<CategoryTreeResponseDto> {
        return this.categoryService.createAdjacent(subCategoryRequest);
    }

    @SystemRoles(SystemRole.ADMIN)
    @Delete(':categoryId')
    public async delete(@Param('categoryId') categoryId: string): Promise<void> {
        return await this.categoryService.delete(categoryId);
    }
}
