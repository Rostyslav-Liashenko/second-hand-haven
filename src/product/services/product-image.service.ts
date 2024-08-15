import { Injectable } from '@nestjs/common';
import { BaseService } from '../../core/services/base.service';
import { UnitOfWorkService } from '../../core/services/unit-of-work.service';
import { NotFoundException } from '../../core/exceptions/not-found.exception';
import { ProductImageRequestDto } from '../dtos/request/product-image.request.dto';
import { ProductImage } from '../entities/product-image.entity';


@Injectable()
export class ProductImageService extends BaseService {
    constructor(protected readonly unitOfWork: UnitOfWorkService) {
        super(unitOfWork);
    }

    public async upsert(productId: string, productImageRequestDtos: ProductImageRequestDto[]): Promise<void> {
        const work = async () => {
            const product = await this.unitOfWork.productRepository.findById(productId);

            if (!product) {
                throw new NotFoundException();
            }

            product.productImages = productImageRequestDtos.map((productImage) =>
                ProductImage.fromDto(productId, productImage));

            await this.unitOfWork.productRepository.save(product);
        }

        return this.unitOfWork.doWork(work);
    }
}
