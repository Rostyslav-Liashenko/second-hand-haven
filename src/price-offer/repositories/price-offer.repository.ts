import { CustomRepository } from '../../typeorm-ex/typeorm-ex.decorator';
import { BaseRepository } from '../../core/repositories/base.repository';
import { PriceOffer } from '../entities/price-offer.entity';
import { PriceOfferStatus } from '../enums/price-offer-status.enum';


@CustomRepository(PriceOffer)
export class PriceOfferRepository extends BaseRepository<PriceOffer> {

    public async findById(id: string): Promise<PriceOffer> {
        return await this.findOne({
            where: {
                id,
            },
            relations: {
                product: true,
                buyer: true,
            }
        });
    }

    public async findByProductIdAndBuyerId(productId: string, buyerId: string): Promise<PriceOffer> {
        return await this.findOne({
            where: {
                product: { id: productId },
                buyer: { id: buyerId },
            },
            relations: {
                product: true,
                buyer: true,
            }
        });
    }

    public async findByStatusAndProductIdAndBuyerId(
        status: PriceOfferStatus,
        productId: string,
        buyerId: string
    ): Promise<PriceOffer> {
        return await this.findOne({
            where: {
                product: { id: productId },
                buyer: { id: buyerId },
                status,
            },
            relations: {
                product: {
                    owner: true,
                },
                buyer: true,
            },
            order: {
                createdAt: 'ASC'
            },
        });
    }
}
