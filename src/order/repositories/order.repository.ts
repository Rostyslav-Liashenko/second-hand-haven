import { CustomRepository } from '../../typeorm-ex/typeorm-ex.decorator';
import { Order } from '../entities/order.entity';
import { BaseRepository } from '../../core/repositories/base.repository';
import { SelectQueryBuilder } from 'typeorm';
import { PageOptionsRequestDto } from '../../core/dto/request/page-options.request.dto';


@CustomRepository(Order)
export class OrderRepository extends BaseRepository<Order> {
    public async findAllQueryBuilder(pageOptionsDto: PageOptionsRequestDto): Promise<SelectQueryBuilder<Order>> {
        return this.createQueryBuilder('order')
            .innerJoinAndSelect('order.buyer', 'buyer')
            .innerJoinAndSelect('buyer.card', 'card')
            .innerJoinAndSelect('buyer.shippingInfo', 'shippingInfo')
            .innerJoinAndSelect('order.orderProducts', 'orderProducts')
            .innerJoinAndSelect('orderProducts.product', 'product')
            .innerJoinAndSelect('product.productImages', 'productImages')
            .innerJoinAndSelect('product.owner', 'owner')
            .innerJoinAndSelect('owner.card', 'ownerCard')
            .skip(pageOptionsDto.skip)
            .take(pageOptionsDto.take)
            .addOrderBy('order.createdAt', 'DESC')
            .addOrderBy('order.id', 'ASC');
    }

    public async findById(id: string): Promise<Order> {
        return this.findOne({
            where: { id },
            relations: {
                buyer: {
                    card: true,
                    shippingInfo: true,
                },
                orderProducts: {
                    product: {
                        productImages: true,
                        owner: {
                            card: true,
                        }
                    },
                },
            },
        });
    }

    public async findByBuyerId(buyerId: string): Promise<Order[]> {
        return this.find({
            where: {
                buyer: { id: buyerId },
            },
            relations: {
                buyer: true,
                orderProducts: {
                    product: {
                        productImages: true,
                        owner: true,
                    },
                },
            },
            order: {
                createdAt: 'DESC'
            },
        });
    }

    public async findBySellerId(sellerId: string): Promise<Order[]> {
        return this.find({
            where: {
                orderProducts: {
                    product: {
                        owner: {
                            id: sellerId
                        },
                    },
                },
            },
            relations: {
                buyer: true,
                orderProducts: {
                    product: {
                        productImages: true,
                        owner: true,
                    },
                },
            },
            order: {
                createdAt: 'DESC'
            },
        });
    }

    public async deleteByProductId(productId: string): Promise<void> {
        await this.createQueryBuilder('order')
            .innerJoinAndSelect('order.products', 'product')
            .where('products.id = :productId', {productId})
            .delete()
            .execute();
    }
}