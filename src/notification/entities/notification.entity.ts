import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { NotificationType } from '../enums/notification-type.enum';
import { User } from '../../user/entities/user.entity';
import { NotificationRecipient } from './notification-recipient.entity';
import { CreateNotificationPriceOfferRequestDto } from '../dtos/request/create-notification-price-offer.request.dto';
import { CreateNotificationPriceOfferResponseDto } from '../dtos/response/create-notification-price-offer.response.dto';
import { PriceOffer } from '../../price-offer/entities/price-offer.entity';
import { NotificationWithPriceOffer } from '../types/notification-with-price-offer.type';
import { Chat } from '../../chat/entities/chat.entity';

@Entity({name: 'notification'})
export class Notification extends BaseEntity {
    @Column({
        name: 'type',
        type: 'enum',
        enum: NotificationType,
        default: NotificationType.EXPECT_OFFER
    })
    public type: NotificationType;

    @Column({
        name: 'entity_id',
        type: 'uuid',
    })
    public entityId: string;

    @ManyToOne(() => User, (user) => user.notifications)
    @JoinColumn({name: 'sender_id'})
    public sender: User;

    @OneToMany(() => NotificationRecipient, (notificationRecipient) => notificationRecipient.notification, {
        cascade: true,
    })
    public notificationRecipients: NotificationRecipient[];

    public static fromCreateNotificationProductOffer(dto: CreateNotificationPriceOfferRequestDto): Notification {
        const notification = new Notification();

        notification.type = NotificationType.EXPECT_OFFER;
        notification.entityId = dto.priceOfferId;
        notification.sender = { id: dto.senderId } as User;

        const notificationRecipient = new NotificationRecipient();

        notificationRecipient.recipient = { id: dto.recipientId } as User;
        notificationRecipient.isRead = false;

        notification.notificationRecipients = [notificationRecipient];

        return notification;
    }

    public static toCreateNotificationProductOffer(
        notification: NotificationWithPriceOffer,
        recipientId?: string
    ): CreateNotificationPriceOfferResponseDto {
        const foundRecipient = notification.notificationRecipients.find(
            (notificationRecipient) => notificationRecipient.recipient.id === recipientId
        );

        const isRead = foundRecipient?.isRead ?? false;

        return {
            id: notification.id,
            type: notification.type,
            sender: User.toDto(notification.sender),
            priceOffer: PriceOffer.toDto(notification.productOffer),
            notificationRecipients: (notification.notificationRecipients || []).map((notificationRecipient) => NotificationRecipient.toDto(notificationRecipient)),
            isRead,
            chat: notification?.message?.chat ? Chat.toDto(notification.message.chat) : null,
        }
    }
}
