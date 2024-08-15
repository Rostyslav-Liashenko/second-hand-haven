import { CustomRepository } from '../../typeorm-ex/typeorm-ex.decorator';
import { BaseRepository } from '../../core/repositories/base.repository';
import { NotificationRecipient } from '../entities/notification-recipient.entity';

@CustomRepository(NotificationRecipient)
export class NotificationRecipientRepository extends BaseRepository<NotificationRecipient> {
    public async read(notificationIds: string[], recipientId: string): Promise<void> {
        await this.createQueryBuilder('notificationRecipient')
            .innerJoin('notificationRecipient.recipient', 'recipient')
            .innerJoin('notificationRecipient.notification', 'notification')
            .update(NotificationRecipient)
            .set({ isRead: true })
            .where('recipient.id = :recipientId', {recipientId})
            .andWhere('notification.id IN (:...notificationIds)', {notificationIds})
            .execute();
    }
}
