import { ApiTags } from '@nestjs/swagger';
import { Controller, Put, Request, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { productStorage, storageProductFolder } from '../../configs/upload-file-config';
import { ProductImageService } from '../services/product-image.service';
import { ProductImageRequestDto } from '../dtos/request/product-image.request.dto';
import { EmailConfirmGuard } from '../../core/guards/email-confirm.guard';
import { DeleteFileInterceptor } from '../../core/interceptors/delete-file.interceptor';
import { DeleteFile } from '../../core/decorators/delete-file.decorator';
import { RequestDeleteFileObjectType } from '../../core/enums/request-delete-file-object-type.enum';
import { SameUserGuard } from '../../core/guards/same-user.guard';
import { SameUser } from '../../core/decorators/same-user.decorator';
import { RequestObjectType } from '../../core/enums/request-object-type.enum';
import { SystemRoles } from '../../core/decorators/system-roles.decorator';
import { SystemRole } from '../../core/enums/system-role.enum';
import { OrGuard } from '@nest-lab/or-guard';
import { SystemRoleGuard } from '../../core/guards/system-role.guard';

@ApiTags('product-images')
@Controller('product-images')
export class ProductImageController {
    constructor(private readonly productImageService: ProductImageService) {}

    @Put()
    @SystemRoles(SystemRole.ADMIN)
    @DeleteFile({
        prefixFolder: storageProductFolder,
        requestDeleteFileObjectType: RequestDeleteFileObjectType.PRODUCT,
    })
    @SameUser({
        requestObjectType: RequestObjectType.PRODUCT_ID,
    })
    @UseInterceptors(DeleteFileInterceptor, AnyFilesInterceptor(productStorage))
    @UseGuards(OrGuard([SameUserGuard, SystemRoleGuard]), EmailConfirmGuard)
    public async uploadFiles(
        @UploadedFiles() files,
        @Request() req
    ): Promise<void> {
        const productId = req.query.productId;
        const productImageRequests: ProductImageRequestDto[] = files.map((file) => ({
            image: `${productId}/${file.filename}`
        }));

        await this.productImageService.upsert(productId, productImageRequests);
    }
}