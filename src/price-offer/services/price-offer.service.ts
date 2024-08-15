import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseService } from '../../core/services/base.service';
import { UnitOfWorkService } from '../../core/services/unit-of-work.service';
import { CreatePriceOfferRequestDto } from '../dtos/request/create-price-offer.request.dto';
import { UpdatePriceOfferRequestDto } from '../dtos/request/update-price-offer.request.dto';
import { MessageService } from '../../chat/services/message.service';
import { CreatePriceOfferWithMessageAndNotificationResponseDto } from '../dtos/response/create-price-offer-with-message-and-notification-response.dto';
import { UpdatePriceOfferResponseDto } from '../dtos/response/update-price-offer.response.dto';
import { NotFoundException } from '../../core/exceptions/not-found.exception';
import { CartService } from '../../cart/services/cart.service';
import { ProductCartRequestDto } from '../../cart/dtos/request/product-cart.request.dto';
import { NotificationService } from '../../notification/services/notification.service';
import {
    CreateNotificationPriceOfferRequestDto
} from '../../notification/dtos/request/create-notification-price-offer.request.dto';
import { PriceOfferStatus } from '../enums/price-offer-status.enum';
import { PriceOffer } from '../entities/price-offer.entity';
import {
    CreateNotificationPriceOfferResponseDto
} from '../../notification/dtos/response/create-notification-price-offer.response.dto';
import { PriceOfferResponseDto } from '../dtos/response/price-offer.response.dto';
import {
    CreateAndUpdatePriceOfferWithMessageAndNotificationResponseDto
} from '../dtos/response/create-and-update-price-offer-with-message-and-notification.response.dto';

@Injectable()
export class PriceOfferService extends BaseService {
    constructor(
        protected readonly unitOfWork: UnitOfWorkService,
        private readonly messageService: MessageService,
        private readonly cartService: CartService,
        private readonly notificationService: NotificationService,
    ) {
        super(unitOfWork);
    }

    public async createWithMessageAndNotificationAndTryAutomateUpdate(
        createProductOfferRequestDto: CreatePriceOfferRequestDto
    ): Promise<CreateAndUpdatePriceOfferWithMessageAndNotificationResponseDto> {
        const createPriceOfferResponseDto = await this.createWithMessageAndNotification(createProductOfferRequestDto);
        const { priceOfferResponseDto } = createPriceOfferResponseDto;

        const product = await this.unitOfWork.productRepository.findById(priceOfferResponseDto.productId);
        const isNeedAutomateUpdate = product.reservedPrice && priceOfferResponseDto.price >= product.reservedPrice;

        if (!isNeedAutomateUpdate) return createPriceOfferResponseDto;

        const updatePriceOfferRequestDto: UpdatePriceOfferRequestDto = {
            productId: product.id,
            buyerId: priceOfferResponseDto.buyerId,
            status: PriceOfferStatus.APPROVED,
        };

        const updatePriceOfferResponseDto = await this.update(updatePriceOfferRequestDto);

        return {
            ...createPriceOfferResponseDto,
            updatePriceOfferResponseDto,
        }
    }

    public async createWithMessageAndNotification(
        createProductOfferRequestDto: CreatePriceOfferRequestDto
    ): Promise<CreatePriceOfferWithMessageAndNotificationResponseDto> {
        const work = async () => {
            const existProductOffer = await this.unitOfWork.priceOfferRepository.findByStatusAndProductIdAndBuyerId(
                PriceOfferStatus.EXPECTED,
                createProductOfferRequestDto.productId,
                createProductOfferRequestDto.buyerId,
            );

            if (existProductOffer) {
                throw new BadRequestException();
            }

            const { productId, buyerId, price } = createProductOfferRequestDto;

            const priceOfferResponseDto = await this.create(createProductOfferRequestDto);
            const priceOfferResponseDtoId = priceOfferResponseDto.id;
            const priceOffer = await this.unitOfWork.priceOfferRepository.findById(priceOfferResponseDto.id);

            const messageResponseDto = await this.messageService.createExpectOfferMessage(productId, buyerId, price, priceOfferResponseDtoId, priceOffer);
            const createNotificationPriceOfferResponseDto = await this.createNotificationByCreatePriceOffer(
                priceOfferResponseDtoId,
                productId,
                buyerId
            );

            return {
                priceOfferResponseDto,
                messageResponseDto,
                createNotificationPriceOfferResponseDto,
            }
        }

        return this.unitOfWork.doWork(work);
    }

    public async create(createPriceOfferRequestDto: CreatePriceOfferRequestDto): Promise<PriceOfferResponseDto> {
        const priceOfferFromDto = PriceOffer.fromCreateDto(createPriceOfferRequestDto);
        const priceOffer = await this.unitOfWork.priceOfferRepository.save(priceOfferFromDto);

        return  PriceOffer.toDto(priceOffer);
    }

    public async createNotificationByCreatePriceOffer(
        priceOfferId: string,
        productId: string,
        buyerId: string,
    ): Promise<CreateNotificationPriceOfferResponseDto> {
        const ownerProduct = await this.unitOfWork.userRepository.findOwnerByProductId(productId);

        const createNotificationDto: CreateNotificationPriceOfferRequestDto = {
            senderId: buyerId,
            recipientId: ownerProduct.id,
            priceOfferId: priceOfferId,
        };

        return await this.createNotification(createNotificationDto);
    }

    public async update(
        updateProductOfferRequestDto: UpdatePriceOfferRequestDto
    ): Promise<UpdatePriceOfferResponseDto> {
        const work = async () => {
            const { productId, buyerId,  } = updateProductOfferRequestDto;
            const priceOfferFromDto = PriceOffer.fromUpdateDto(updateProductOfferRequestDto);
            const priceOfferToUpdate = await this.unitOfWork.priceOfferRepository.findByStatusAndProductIdAndBuyerId(
                PriceOfferStatus.EXPECTED,
                productId,
                buyerId,
            );

            if (!priceOfferToUpdate) {
                throw new NotFoundException();
            }

            priceOfferToUpdate.status = priceOfferFromDto.status;
            const productOffer = await this.unitOfWork.priceOfferRepository.save(priceOfferToUpdate);

            const { price, status, id } = productOffer;
            const isApproveStatus = status === PriceOfferStatus.APPROVED;

            await this.addInCartIfApproveStatus(updateProductOfferRequestDto, isApproveStatus);

            const messageResponseDto = isApproveStatus
                ? await this.messageService.createApproveOfferMessage(productId, price, priceOfferToUpdate.id, priceOfferToUpdate)
                : await this.messageService.createRejectOfferMessage(productId, price, priceOfferToUpdate.id, priceOfferToUpdate);

            const priceOfferResponseDto = PriceOffer.toDto(productOffer);

            const createNotificationDto: CreateNotificationPriceOfferRequestDto = {
                senderId: priceOfferToUpdate.product.owner.id,
                recipientId: buyerId,
                priceOfferId: id,
            };

            const createNotificationProductOfferResponseDto = await this.createNotification(createNotificationDto);

            return {
                priceOfferResponseDto,
                messageResponseDto,
                createNotificationProductOfferResponseDto,
            }
        }

        return this.unitOfWork.doWork(work);
    }

    private async addInCartIfApproveStatus(
        updatePriceOfferRequestDto: UpdatePriceOfferRequestDto,
        isApproveStatus: boolean
    ): Promise<void> {
        if (!isApproveStatus) return ;

        const { buyerId, productId } = updatePriceOfferRequestDto;

        const productCartRequestDto: ProductCartRequestDto = {
            userId: buyerId,
            productId: productId,
        }

        try {
            await this.cartService.addProduct(productCartRequestDto);
        } catch {}
    }

    private async createNotification(
        createNotificationDto: CreateNotificationPriceOfferRequestDto
    ): Promise<CreateNotificationPriceOfferResponseDto> {
        const notificationResponseDto = await this.notificationService.createByPriceOffer(createNotificationDto);

        return await this
            .notificationService
            .findByIdNotificationProductOfferResponseDto(notificationResponseDto.id)
    }
}
