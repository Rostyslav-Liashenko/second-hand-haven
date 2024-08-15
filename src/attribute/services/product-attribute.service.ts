import { Injectable } from '@nestjs/common';
import { BaseService } from '../../core/services/base.service';
import { UnitOfWorkService } from '../../core/services/unit-of-work.service';
import { IdValuesRequestDto } from '../../core/dto/request/id-values.request.dto';
import { ProductAttribute } from '../entities/product-attribute.entity';
import { UpdateProductAttributeValueRequestDto } from '../dtos/request/update-product-attribute-value.request.dto';

@Injectable()
export class ProductAttributeService extends BaseService {
    constructor(protected readonly unitOfWork: UnitOfWorkService) {
        super(unitOfWork);
    }

    public async updateProductAttribute(
        attributeId: string,
        updateAttributeValueDto: UpdateProductAttributeValueRequestDto
    ): Promise<void> {
        const work = async () => {
            const { productId, values } = updateAttributeValueDto;

            await this.unitOfWork.productAttributeRepository.deleteByAttributeIdAndProductId(attributeId, productId);
            await this.unitOfWork.productAttributeRepository.batchInsert(attributeId, productId, values);
        }

        return await this.unitOfWork.doWork(work);
    }

    public async toProductAttributes(attributeIdValues: IdValuesRequestDto[]): Promise<ProductAttribute[]> {
        const productAttributes: ProductAttribute[] = [];

        attributeIdValues.forEach((attributeIdValuesDto) => {
            const productAttrs = attributeIdValuesDto.values.map((value) => ProductAttribute.fromAttributeIdValues(
                attributeIdValuesDto.id,
                value,
            ));

            productAttributes.push(...productAttrs);
        });

        return productAttributes;
    }
}