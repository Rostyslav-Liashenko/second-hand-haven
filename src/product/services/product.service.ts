import { Injectable } from '@nestjs/common';
import { BaseService } from '../../core/services/base.service';
import { UnitOfWorkService } from '../../core/services/unit-of-work.service';
import { UpdateProductRequestDto } from '../dtos/request/update-product.request.dto';
import { Product } from '../entities/product.entity';
import { ProductResponseDto } from '../dtos/response/product.response.dto';
import { NotFoundException } from '../../core/exceptions/not-found.exception';
import { PageOptionsRequestDto } from '../../core/dto/request/page-options.request.dto';
import { PageResponseDto } from '../../core/dto/response/page.response.dto';
import { PaginationService } from '../../core/services/pagination.service';
import { QuantityLikeResponseDto } from '../dtos/response/quantity-like.response.dto';
import { SelectQueryBuilder } from 'typeorm';
import { ProductDetailedAttributeResponseDto } from '../dtos/response/product-detailed-attribute.response.dto';
import { FilterProductRequestDto } from '../dtos/request/filter-product.request.dto';
import { CreateProductRequestDto } from '../dtos/request/create-product.request.dto';
import { ProductAttributeService } from '../../attribute/services/product-attribute.service';
import { CategoryService } from '../../category/services/category.service';
import { IdValuesRequestDto } from '../../core/dto/request/id-values.request.dto';
import { AttributeService } from '../../attribute/services/attribute.service';
import { AttributeType } from '../../attribute/enums/attribute-type.enum';
import { TotalMaxMinPropertyResponseDto } from '../dtos/response/total-max-min-property.response.dto';
import { PageWithDataMetaResponseDto } from '../../core/dto/response/page-with-data-meta.response.dto';
import { corePath, storageProductFolder } from '../../configs/upload-file-config';
import { FileService } from '../../core/services/file.service';
import { ProductWithStatisticResponseDto } from '../dtos/response/product-with-statistic.response.dto';
import {
    ProductDetailedAttributeBeforeUpdateResponseDto
} from '../dtos/response/product-detailed-attribute-before-update.response.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ProductService extends BaseService {
    constructor(
        protected readonly unitOfWork: UnitOfWorkService,
        private readonly paginationService: PaginationService,
        private readonly attributeService: AttributeService,
        private readonly productAttributeService: ProductAttributeService,
        private readonly categoryService: CategoryService,
        private readonly fileService: FileService,
    ) {
        super(unitOfWork);
    }


    public async findAll(pageOptionsDto: PageOptionsRequestDto): Promise<PageResponseDto<ProductResponseDto>> {
        const productQueryBuilder = await this.unitOfWork.productRepository.findQueryBuilderByFilter(
            pageOptionsDto,
        );

        return this.createPaginationPage(productQueryBuilder, pageOptionsDto);
    }

    public async findQuantityLike(id: string): Promise<QuantityLikeResponseDto> {
        const quantityLike = await this.unitOfWork.productWishlistRepository.findQuantityProduct(id);

        return { quantityLike };
    }


    public async findJustArrived(quantity: number, userId?: string): Promise<ProductResponseDto[]> {
        const products = await this.unitOfWork.productRepository.findJustArrived(quantity, userId);

        return products.map((product) => Product.toDto(product));
    }

    public async findById(id: string, userId?: string): Promise<ProductDetailedAttributeResponseDto> {
        const product = await this.unitOfWork.productRepository.findById(id, userId);

        if (!product) {
            throw new NotFoundException();
        }

        const attributes = await this.unitOfWork.attributeRepository.findByProductId(product.id);

        return Product.toProductDetailedAttributesDto(product, attributes);
    }

    public async findByIdBeforeUpdate(id: string, userId?: string): Promise<ProductDetailedAttributeBeforeUpdateResponseDto> {
        const product = await this.unitOfWork.productRepository.findById(id, userId);

        if (!product) {
            throw new NotFoundException();
        }

        const attributes = await this.unitOfWork.attributeRepository.findByProductId(product.id);

        return  {
            ...Product.toProductDetailedAttributesDto(product, attributes),
            reservedPrice: product.reservedPrice,
        }
    }

    public async findByCategoryId(
        categoryId: string,
        pageOptionsDto: PageOptionsRequestDto,
        productFilterRequestDto: FilterProductRequestDto,
        userId?: string,
    ): Promise<PageWithDataMetaResponseDto<ProductResponseDto[], TotalMaxMinPropertyResponseDto>> {
        const categoryIds = await this.categoryService.findChildrenIdsIncludeParentId(categoryId);

        const productQueryBuilder = await this.unitOfWork.productRepository.findQueryBuilderByFilter(
            pageOptionsDto,
            productFilterRequestDto,
            categoryIds,
            userId,
        );

        return this.createFilteredPaginationPage(productQueryBuilder, pageOptionsDto);
    }

    public async findByUserPublicProfileId(
        userPublicProfileId: string,
        pageOptionsDto: PageOptionsRequestDto,
        userId?: string,
    ): Promise<PageResponseDto<ProductResponseDto>> {
        const productQueryBuilder = await this.unitOfWork.productRepository.findByUserPublicProfileId(
            pageOptionsDto,
            userPublicProfileId,
            userId,
        );

        return this.createPaginationPage(productQueryBuilder, pageOptionsDto);
    }

    public async findBySellerId(sellerId: string): Promise<ProductResponseDto[]> {
        const products = await this.unitOfWork.productRepository.findByOwnerId(sellerId);

        return products.map((product) => Product.toDto(product));
    }

    public async findBySellerIdWithStatistic(sellerId: string): Promise<ProductWithStatisticResponseDto[]> {
        const selectQueryBuilder = await this.unitOfWork.productRepository.findByOwnerIdWithStatistic(sellerId);
        const { raw, entities } = await selectQueryBuilder.getRawAndEntities();

        return entities.map((entity) => {
            const foundedEntity = raw.find((rawRecord) => rawRecord.product_id === entity.id);

            const statistic = foundedEntity
                ? { countChats: +foundedEntity.chatCount, countLikes: +foundedEntity.wishlistCount, countView: +foundedEntity.viewCount }
                : { countChats: 0, countLikes: 0, countView: 0 }

            return {
                product: Product.toDto(entity),
                ...statistic,
            }
        });
    }

    public async create(productCreateRequestDto: CreateProductRequestDto): Promise<ProductResponseDto> {
        const work = async () => {
            const { categoryId, attributeIdValues } = productCreateRequestDto;

            const additionalIdValues = await this.findAdditionalIdValues(categoryId, attributeIdValues);
            const attributesToProductAttributes = [...attributeIdValues, ...additionalIdValues];

            const productFromDto = Product.fromCreateProductRequest(productCreateRequestDto);
            productFromDto.productAttributes = await this.productAttributeService.toProductAttributes(attributesToProductAttributes);

            const product = await this.unitOfWork.productRepository.save(productFromDto);

            return Product.toDto(product);
        }

        return await this.unitOfWork.doWork(work);
    }

    public async update(id: string, productRequestDto: UpdateProductRequestDto): Promise<ProductResponseDto> {
        const work = async () => {
            const attributeIdValues = productRequestDto.attributeIdValues;
            const productFromDto = Product.fromUpdateProductRequest(productRequestDto);
            const productToUpdate = await this.unitOfWork.productRepository.findById(id);

            if (!productToUpdate) {
                throw new NotFoundException();
            }

            const productIdToUpdate = productToUpdate.id;
            productToUpdate.name = productFromDto.name;
            productToUpdate.price = productFromDto.price;
            productToUpdate.reservedPrice = productFromDto.reservedPrice ?? null;
            productToUpdate.owner = productFromDto.owner;
            productToUpdate.category = productFromDto.category;
            productToUpdate.description = productFromDto.description;

            await this.unitOfWork.productAttributeRepository.deleteByProductId(productIdToUpdate);
            await this.unitOfWork.productAttributeRepository.batchInsertByIdValues(attributeIdValues, productIdToUpdate);

            const product = await this.unitOfWork.productRepository.save(productToUpdate);

            return Product.toDto(product);
        }

        return await this.unitOfWork.doWork(work);
    }

    public async updateCountView(productId: string): Promise<void> {
        await this.unitOfWork.productRepository.updateCountView(productId);
    }

    public async markAsSold(productIds: string[]): Promise<void> {
        const work = async () => {
            await this.unitOfWork.productRepository.markProductsAsSold(productIds);
        };

        await this.unitOfWork.doWork(work);
    }

    public async delete(id: string): Promise<void> {
        const work = async () => {
            const product = await this.unitOfWork.productRepository.findById(id);

            if (!product) {
                throw new NotFoundException();
            }

            this.deleteImagesByProductId(product.id);

            await this.unitOfWork.productCartRepository.softDeleteByProductId(id);
            await this.unitOfWork.productWishlistRepository.softDeleteByProductId(id);
            await this.unitOfWork.productAttributeRepository.softDeleteByProductId(id);
            await this.unitOfWork.productImageRepository.softDeleteByProductId(id);
            await this.unitOfWork.messageReaderRepository.softDeleteByProductId(id);
            await this.unitOfWork.messageRepository.softDeleteByProductId(id);
            await this.unitOfWork.userChatRepository.softDeleteByProductId(id);
            await this.unitOfWork.chatRepository.softDeleteByProductId(id);
            await this.unitOfWork.productRepository.softRemove(product);
        }

        return await this.unitOfWork.doWork(work);
    }

    public async deleteByIds(ids: string[]): Promise<void> {
        const work = async () => {
            ids.forEach((id) => this.deleteImagesByProductId(id));

            await this.unitOfWork.productCartRepository.softDeleteByProductIds(ids);
            await this.unitOfWork.productWishlistRepository.softDeleteByProductIds(ids);
            await this.unitOfWork.productAttributeRepository.softDeleteByProductIds(ids);
            await this.unitOfWork.productImageRepository.softDeleteByProductIds(ids);
            await this.unitOfWork.messageReaderRepository.softDeleteByProductIds(ids);
            await this.unitOfWork.messageRepository.softDeleteByProductIds(ids);
            await this.unitOfWork.userChatRepository.softDeleteByProductIds(ids);
            await this.unitOfWork.chatRepository.softDeleteByProductIds(ids);
            await this.unitOfWork.productRepository.deleteByIds(ids);
        };

        return await this.unitOfWork.doWork(work);
    }

    @Cron(CronExpression.EVERY_12_HOURS)
    public async deleteSoldProducts(): Promise<void> {
        const soldProducts = await this.unitOfWork.productRepository.findSoldProducts();
        const isEmpty = soldProducts.length === 0;

        if (isEmpty) return;

        const productIds = soldProducts.map((soldProduct) => soldProduct.id);
        await this.deleteByIds(productIds);
    }

    private deleteImagesByProductId(productId: string): void {
        const productDirectory = `${corePath}/${storageProductFolder}/${productId}`;
        const isExistDirectory = this.fileService.isExistDirectory(productDirectory);

        if (!isExistDirectory) return;

        this.fileService.deleteDirectoryIncludeFile(productDirectory);
    }

    private async createPaginationPage(
        queryBuilder:  SelectQueryBuilder<Product>,
        pageOptionsDto: PageOptionsRequestDto
    ): Promise<PageResponseDto<ProductResponseDto>> {
        const { entities } = await queryBuilder.getRawAndEntities();
        const totalMaxMinProperty = await this.findTotalMaxMinPropertyFromProducts(queryBuilder);

        const totalItemCount = totalMaxMinProperty.total;
        const productResponseDtos = entities.map((product) => Product.toDto(product));

        return this.paginationService.createPage(productResponseDtos, pageOptionsDto, totalItemCount);
    }

    private async createFilteredPaginationPage(
        queryBuilder:  SelectQueryBuilder<Product>,
        pageOptionsDto: PageOptionsRequestDto
    ): Promise<PageWithDataMetaResponseDto<ProductResponseDto[], TotalMaxMinPropertyResponseDto>> {
        const { entities } = await queryBuilder.getRawAndEntities();
        const totalMaxMinProperty = await this.findTotalMaxMinPropertyFromProducts(queryBuilder);

        const totalItemCount = totalMaxMinProperty.total;
        const productResponseDtos = entities.map((product) => Product.toDto(product));

        return this.paginationService.createPageWithDataMeta(productResponseDtos, totalMaxMinProperty, pageOptionsDto, totalItemCount);
    }

    private async findTotalMaxMinPropertyFromProducts(
        productQueryBuilder: SelectQueryBuilder<Product>
    ): Promise<TotalMaxMinPropertyResponseDto> {
        const totalMaxMinQueryBuilder = productQueryBuilder
            .select('COUNT(DISTINCT(product.id)) as total, MAX(product.price) as "maxPrice", MIN(product.price) as "minPrice"')
            .orderBy({});

        const result = await totalMaxMinQueryBuilder.getRawOne();

        return {
            total: +result.total,
            min: +result.minPrice,
            max: +result.maxPrice
        }
    }

    private async findAdditionalIdValues(
        categoryId: string,
        existIdValues: IdValuesRequestDto[]
    ): Promise<IdValuesRequestDto[]> {
        const attributesByCategory = await this.unitOfWork.attributeRepository.findByCategoryId(categoryId);
        const additionalIdValues: IdValuesRequestDto[] = [];

        attributesByCategory.forEach((attributeByCategory) => {
            const foundedIdValues = existIdValues.find(
                (attributeIdValue) => attributeIdValue.id === attributeByCategory.id
            );

            if (!foundedIdValues && attributeByCategory.type === AttributeType.CHECKBOX) {
                const defaultValue = this.attributeService.findDefaultValue(attributeByCategory.type);
                additionalIdValues.push({ id: attributeByCategory.id, values: [String(defaultValue)] });
            }
        });

        return additionalIdValues;
    }
}
