import { CustomRepository } from '../../typeorm-ex/typeorm-ex.decorator';
import { Product } from '../entities/product.entity';
import { BaseRepository } from '../../core/repositories/base.repository';
import { SelectQueryBuilder } from 'typeorm';
import { AttributeType } from '../../attribute/enums/attribute-type.enum';
import { FilterProductRequestDto } from '../dtos/request/filter-product.request.dto';
import { PageOptionsRequestDto } from '../../core/dto/request/page-options.request.dto';
import { ProductWishlist } from '../../wishlist/entities/product-wishlist.entity';
import { PriceOffer } from '../../price-offer/entities/price-offer.entity';
import { OrderStatus } from '../../order/enums/order-status.enum';
import { sub } from 'date-fns';

@CustomRepository(Product)
export class ProductRepository extends BaseRepository<Product> {

    public async findAll(): Promise<Product[]> {
        return await this.createQueryBuilder('product')
            .innerJoinAndSelect('product.category', 'category')
            .innerJoinAndSelect('product.owner', 'owner')
            .leftJoinAndSelect('product.productImages', 'productImage')
            .orderBy('product.createdAt')
            .getMany();
    }

    public async markProductsAsSold(productIds: string[]): Promise<void> {
        await this.createQueryBuilder()
            .update(Product)
            .set({ isSold: true })
            .where('id = :...productIds', { productIds })
            .execute();
    }

    public async findSoldProducts(): Promise<Product[]> {
        const dayAgo = sub(new Date(), { days: 2 });

        return this.createQueryBuilder('product')
            .innerJoin('product.orderProducts', 'orderProducts')
            .innerJoin('orderProducts.order', 'order')
            .where('product.isSold = :isSold', { isSold: true })
            .andWhere('order.status = :orderStatus', { orderStatus: OrderStatus.CLOSED })
            .andWhere('order.createdAt >= :createdAt', { createdAt: dayAgo })
            .getMany();
    }

    public async findById(productId: string, userId?: string): Promise<Product> {
        const productQueryBuilder = this.createQueryBuilder('product');

        const productWishlistQueryBuilder = userId
            ? await this.findQueryBuilderWishlist(productQueryBuilder, userId)
            : productQueryBuilder;

        return await productWishlistQueryBuilder
            .innerJoinAndSelect('product.owner', 'owner')
            .innerJoinAndSelect('product.category', 'category')
            .leftJoinAndSelect('product.productImages', 'productImage')
            .where('product.id = :productId', {productId})
            .getOne();
    }

    public async findByManyId(productIds: string[], buyerId: string): Promise<Product[]> {
        const subQuery = this.manager
            .createQueryBuilder()
            .select('priceOffer.id')
            .from(PriceOffer, 'priceOffer')
            .innerJoin('priceOffer.buyer', 'buyer')
            .where(`buyer.id = '${buyerId}'`);

        return this.createQueryBuilder('product')
            .leftJoinAndSelect('product.owner', 'owner')
            .leftJoinAndSelect(
                'product.priceOffers',
                'priceOffers',
                `priceOffers.id IN (${subQuery.getQuery()})`
            )
            .where('product.id IN (:...productIds)', {productIds})
            .addOrderBy('owner.id', 'ASC')
            .addOrderBy('priceOffers.createdAt', 'ASC')
            .getMany();
    }

    public async findJustArrived(quantity: number, userId?: string): Promise<Product[]> {
        const productQueryBuilder = this.createQueryBuilder('product');

        const productWishlistQueryBuilder = userId
            ? await this.findQueryBuilderWishlist(productQueryBuilder, userId)
            : productQueryBuilder;

        return productWishlistQueryBuilder
            .innerJoinAndSelect('product.owner', 'user')
            .leftJoinAndSelect('product.productImages', 'productImages')
            .orderBy('product.createdAt', 'DESC')
            .take(quantity)
            .getMany();
    }

    public async deleteById(productId: string): Promise<void> {
        await this.createQueryBuilder('product')
            .delete()
            .from(Product)
            .where('product.id = :productId', {productId})
            .execute();
    }

    private async findQueryBuilderWishlist(
        queryBuilder: SelectQueryBuilder<Product>,
        userId: string,
    ): Promise<SelectQueryBuilder<Product>> {
        const subQuery = await this.manager
            .createQueryBuilder()
            .select('productWishlist.id')
            .from(ProductWishlist, 'productWishlist')
            .leftJoin('productWishlist.wishlist', 'wishlist')
            .andWhere(`wishlist.user.id = '${userId}'`);

        return queryBuilder
            .leftJoinAndSelect(
                'product.productWishlists',
                'productWishlist',
                `productWishlist.id IN (${subQuery.getQuery()})`
            );
    }

    public async findQueryBuilderByFilter(
        pageOptionsDto: PageOptionsRequestDto,
        productFilter?: FilterProductRequestDto,
        categoryIds?: string[],
        userId?: string,
    ): Promise<SelectQueryBuilder<Product>> {
        const productQueryBuilder = this.createQueryBuilder('product');

        const productWishlistQueryBuilder = userId
            ? await this.findQueryBuilderWishlist(productQueryBuilder, userId)
            : productQueryBuilder;

        const productFilteredQueryBuild = productFilter
            ? this.acceptFilter(productWishlistQueryBuilder, productFilter)
            : productWishlistQueryBuilder;

        const productFilteredCategoryQueryBuilder = categoryIds
            ? productFilteredQueryBuild.andWhere('category.id in (:...categoryIds)', {categoryIds})
            : productFilteredQueryBuild;

        productFilteredCategoryQueryBuilder
            .innerJoinAndSelect('product.category', 'category')
            .innerJoinAndSelect('product.owner', 'user')
            .leftJoinAndSelect('product.productImages', 'productImages')
            .skip(pageOptionsDto.skip)
            .take(pageOptionsDto.take)
            .addOrderBy('product.createdAt', 'DESC');

        return productFilteredQueryBuild;
    }

    public async findByOwnerId(ownerId: string): Promise<Product[]> {
        return this.find({
            where: {
                owner: {
                    id: ownerId
                },
            },
            relations: {
                owner: true,
                productImages: true,
                category: true,
            }
        });
    }

    public async findByOwnerIdWithStatistic(ownerId: string): Promise<SelectQueryBuilder<Product>> {
        return this.createQueryBuilder('product')
            .innerJoin('product.owner', 'owner')
            .where('owner.id = :ownerId', {ownerId})
            .innerJoin('product.productImages', 'productImages')
            .innerJoin('product.category', 'category')
            .leftJoin('product.productWishlists', 'wishlist')
            .leftJoin('product.chats', 'chat')
            .select([
                'product.id',
                'product.name',
                'product.description',
                'product.createdAt',
                'product.price',
                'owner.id',
                'owner.firstName',
                'owner.lastName',
                'owner.imageUrl',
                'owner.publicProfileId',
                'owner.systemRole',
                'owner.isEmailConfirm',
                'productImages.image',
                'category.id',
                'category.name',
                'category.order',
                'COUNT(wishlist.id) as "wishlistCount", COUNT(chat.id) as "chatCount", product.countView as "viewCount" '
            ])
            .groupBy('product.id, owner.id, category.id, productImages.id');
    }

    public async updateCountView(productId: string): Promise<void> {
        await this.createQueryBuilder()
            .update(Product)
            .set(({
                countView: () => "countView + 1",
            }))
            .where('id = :productId',{productId})
            .execute();
    }

    public async findByUserPublicProfileId(
        pageOptionsDto: PageOptionsRequestDto,
        userPublicProfileId: string,
        userId?: string
    ): Promise<SelectQueryBuilder<Product>> {
        const queryBuilder = this.createQueryBuilder('product');

        const productQueryBuilder = userId
            ? await this.findQueryBuilderWishlist(queryBuilder, userId)
            : queryBuilder;

        return productQueryBuilder
            .innerJoinAndSelect('product.category', 'category')
            .innerJoinAndSelect('product.owner', 'user')
            .leftJoinAndSelect('product.productImages', 'productImages')
            .skip(pageOptionsDto.skip)
            .take(pageOptionsDto.take)
            .where('user.publicProfileId = :publicProfileId', {publicProfileId: userPublicProfileId})
            .orderBy('product.createdAt', 'ASC');
    }

    private findCastType(attributeType: AttributeType): string {
        return attributeType === AttributeType.NUMBER_INPUT
            ? '::decimal'
            : '';
    }

    private acceptFilter(
        queryBuilder: SelectQueryBuilder<Product>,
        productFilter: FilterProductRequestDto
    ): SelectQueryBuilder<Product> {
        const aliasMap = new Map<string, string>();
        const { filters, numberFilters, sorting, priceFilter, searchFilter } = productFilter;

        filters.forEach((filter, index) => {
            const aliasJoin = `Value${index}`;
            const values = filter.values.map((value) => `'${value}'`).join(',');
            aliasMap.set(filter.id, aliasJoin);

            queryBuilder
                .innerJoin('product.productAttributes', `${aliasJoin}`)
                .andWhere(`${aliasJoin}.attribute.id = '${filter.id}' AND ${aliasJoin}.value IN (${values})`);
        });

        numberFilters.forEach((filter, index) => {
            const aliasJoin = `Value${index + aliasMap.size + 1}`;
            aliasMap.set(filter.id, aliasJoin);

            queryBuilder
                .innerJoin('product.productAttributes', `${aliasJoin}`)
                .andWhere(`${aliasJoin}.attribute.id = '${filter.id}' AND (${aliasJoin}.value)::DECIMAL BETWEEN ${filter.min} AND ${filter.max}`);
        });

        sorting.forEach((sort, index) => {
            const caseType = this.findCastType(sort.type);
            const foundedAlias = aliasMap.get(sort.id);
            const aliasJoin = foundedAlias ?? `Value${index + aliasMap.size + 1}`;

            if (!foundedAlias) {
                queryBuilder
                    .innerJoin('product.productAttributes', `${aliasJoin}`)
                    .andWhere(`${aliasJoin}.attribute.id = '${sort.id}'`);
            }

            queryBuilder
                .addOrderBy(`CASE WHEN ${aliasJoin}.attribute.id = '${sort.id}' THEN (${aliasJoin}.value)${caseType} END`);
        });

        if (priceFilter) {
            queryBuilder.andWhere(`product.price BETWEEN ${priceFilter.min} AND ${priceFilter.max}`)
        }

        if (searchFilter) {
            queryBuilder.andWhere('product.name LIKE :name', { name: `%${searchFilter.searchQuery}%`});
        }

        return queryBuilder;
    }

    public async deleteByIds(ids: string[]): Promise<void> {
        await this.createQueryBuilder('product')
            .softDelete()
            .where('product.id IN (:...ids)', {ids})
            .execute();
    }
}
