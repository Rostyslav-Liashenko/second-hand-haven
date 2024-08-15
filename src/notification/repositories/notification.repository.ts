import { CustomRepository } from '../../typeorm-ex/typeorm-ex.decorator';
import { BaseRepository } from '../../core/repositories/base.repository';
import { Notification } from '../entities/notification.entity';
import { NotificationRecipient } from '../entities/notification-recipient.entity';
import { PriceOffer } from '../../price-offer/entities/price-offer.entity';
import { SelectQueryBuilder } from 'typeorm';
import { Chat } from '../../chat/entities/chat.entity';
import { Message } from '../../chat/entities/message.entity';


@CustomRepository(Notification)
export class NotificationRepository extends BaseRepository<Notification> {
    public async findById(id: string): Promise<Notification> {
        return this.findOne({
            where: {
                id
            },
        });
    }

    public async findByIdWithPriceOffer(id: string): Promise<Notification> {
        const baseQuery = this.findBaseQueryByGet();

        return baseQuery
            .where('notification.id = :id', {id})
            .getOne();
    }

    public async findNotificationWithPriceOfferByUserId(userId: string): Promise<Notification[]> {
        const baseQuery = this.findBaseQueryByGet();

        const subQuery = this.manager
            .createQueryBuilder()
            .select('notificationRecipient.id')
            .from(NotificationRecipient, 'notificationRecipient')
            .innerJoin('notificationRecipient.recipient', 'recipient')
            .where(`recipient.id = '${userId}'`);

        return baseQuery
            .where(`notificationRecipients.id IN (${subQuery.getQuery()})`)
            .orderBy('notification.createdAt', 'DESC')
            .getMany();
    }

    private findBaseQueryByGet(): SelectQueryBuilder<Notification>  {
        return this.createQueryBuilder('notification')
            .innerJoinAndSelect('notification.sender', 'sender')
            .innerJoinAndSelect('notification.notificationRecipients', 'notificationRecipients')
            .innerJoinAndSelect('notificationRecipients.recipient', 'recipient')
            .innerJoinAndMapOne("notification.productOffer", PriceOffer, 'productOffer', 'notification.entityId = productOffer.id')
            .leftJoinAndMapOne('notification.message', Message, 'message', 'notification.entityId = message.entityId')
            .leftJoinAndSelect('message.chat', 'chat')
            .leftJoinAndSelect('chat.product', 'chatProduct')
            .innerJoinAndSelect('productOffer.buyer', 'buyer')
            .innerJoinAndSelect('productOffer.product', 'product');
    }
}
