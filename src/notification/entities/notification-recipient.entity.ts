import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Notification } from './notification.entity';
import { User } from '../../user/entities/user.entity';
import { BaseEntity } from '../../core/entities/base.entity';
import { NotificationRecipientResponseDto } from '../dtos/response/notification-recipient.response.dto';

@Entity({name: 'notification_recipient'})
export class NotificationRecipient extends BaseEntity {

    @ManyToOne(() => Notification, (notification) => notification.notificationRecipients)
    @JoinColumn({name: 'notification_id'})
    public notification: Notification;

    @ManyToOne(() => User, (user) => user.notificationRecipients)
    @JoinColumn({name: 'recipient_id'})
    public recipient: User;

    @Column({name: 'is_read', type: 'boolean'})
    public isRead: boolean;

    public static toDto(notificationRecipient: NotificationRecipient): NotificationRecipientResponseDto {
        return  {
            recipient: User.toDto(notificationRecipient.recipient),
            isRead: notificationRecipient.isRead,
        }
    }
}
