import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UnitOfWorkService } from '../../core/services/unit-of-work.service';
import { NotFoundException } from '../../core/exceptions/not-found.exception';
import { PriceOfferStatus } from '../../price-offer/enums/price-offer-status.enum';
import { PriceOffer } from '../../price-offer/entities/price-offer.entity';

@Injectable()
export class ChangeProductOfferStatusGuard implements CanActivate {

    constructor(private readonly unitOfWork: UnitOfWorkService) {}

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const senderId = '024d5693-ad47-425f-b5de-6d02f148713c';
        const productId: string = request.body.productId;
        const buyerId: string = request.body.buyerId;
        const statusToUpdate: PriceOfferStatus = request.body.status;

        const productOffer = await this.unitOfWork.priceOfferRepository.findByProductIdAndBuyerId(
            productId,
            buyerId
        );

        if (!productOffer) {
            throw new NotFoundException();
        }

        const isCorrectTransform = this.isCorrectTransform(productOffer, statusToUpdate);
        const isSameUser = senderId === buyerId;

        return !isSameUser && isCorrectTransform;
    }

    public isCorrectTransform(productOffer: PriceOffer, statusToUpdate: PriceOfferStatus): boolean {
        const productOfferStatus = productOffer.status;

        return productOfferStatus === PriceOfferStatus.EXPECTED &&
            (statusToUpdate === PriceOfferStatus.APPROVED ||
            statusToUpdate === PriceOfferStatus.REJECTED);
    }
}