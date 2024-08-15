import { Injectable } from '@nestjs/common';
import { BaseService } from '../../core/services/base.service';
import { UnitOfWorkService } from '../../core/services/unit-of-work.service';
import {
    CreateNotificationPriceOfferRequestDto
} from '../dtos/request/create-notification-price-offer.request.dto';
import { Notification } from '../entities/notification.entity';
import {
    CreateNotificationPriceOfferResponseDto
} from '../dtos/response/create-notification-price-offer.response.dto';
import { NotFoundException } from '../../core/exceptions/not-found.exception';
import { ReadNotificationRequestDto } from '../dtos/request/read-notification.request.dto';
import { NotificationWithPriceOffer } from '../types/notification-with-price-offer.type';

@Injectable()
export class NotificationService extends BaseService {
    constructor(protected readonly unitOfWork: UnitOfWorkService) {
        super(unitOfWork);
    }

    public async findByIdNotificationProductOfferResponseDto(
        id: string
    ): Promise<CreateNotificationPriceOfferResponseDto> {
        const notification = await this.unitOfWork.notificationRepository.findByIdWithPriceOffer(id);
        const notificationWithProductOffer = notification as NotificationWithPriceOffer;

        return Notification.toCreateNotificationProductOffer(notificationWithProductOffer);
    }

    public async getCreateNotificationPriceOfferResponseDto(
        userId: string
    ): Promise<CreateNotificationPriceOfferResponseDto[]> {
        const notifications = await this.unitOfWork.notificationRepository.findNotificationWithPriceOfferByUserId(userId);

        return notifications.map((notification) => {
            const notificationWithProductOffer = notification as NotificationWithPriceOffer;

            return Notification.toCreateNotificationProductOffer(notificationWithProductOffer, userId);
        });
    }

    public async deleteById(id: string): Promise<void> {
        const notification = await this.unitOfWork.notificationRepository.findById(id);

        if (!notification) {
            throw new NotFoundException();
        }

        await this.unitOfWork.notificationRepository.softRemove(notification);
    }

    public async createByPriceOffer(
        createNotificationPriceOfferRequestDto: CreateNotificationPriceOfferRequestDto,
    ): Promise<CreateNotificationPriceOfferResponseDto> {
        const work = async () => {
            const notificationFromDto = Notification.fromCreateNotificationProductOffer(createNotificationPriceOfferRequestDto);
            const notification = await this.unitOfWork.notificationRepository.save(notificationFromDto);

            return await this.findByIdNotificationProductOfferResponseDto(notification.id);
        }

        return await this.unitOfWork.doWork(work);
    }

    public async read(
        readNotificationRequestDto: ReadNotificationRequestDto,
    ): Promise<void> {
        const work = async () => {
            const { notificationIds, recipientId } = readNotificationRequestDto;
            await this.unitOfWork.notificationRecipientRepository.read(notificationIds, recipientId);
        };

        return await this.unitOfWork.doWork(work);
    }
}
