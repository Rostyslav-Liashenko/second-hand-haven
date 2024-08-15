import { CustomRepository } from '../../typeorm-ex/typeorm-ex.decorator';
import { UserChat } from '../entities/user-chat.entity';
import { BaseRepository } from '../../core/repositories/base.repository';


@CustomRepository(UserChat)
export class UserChatRepository extends BaseRepository<UserChat> {

    public async findUserChatsByChatId(chatId: string): Promise<UserChat[]> {
        return this.find({
            where: {
                chat: { id : chatId }
            },
            relations: {
                user: true,
            }
        });
    }

    public async deleteByProductId(productId: string): Promise<void> {
        await this.query(`DELETE FROM user_chat
            WHERE chat_id IN (
                SELECT chat.id
                FROM chat
                INNER JOIN product ON chat.product_id = product.id
                WHERE product.id = '${productId}'
            )
        `);
    }

    public async softDeleteByProductId(productId: string): Promise<void> {
        const currentTimestamp = new Date().toISOString();

        await this.query(
            `UPDATE user_chat
             SET deleted_at = '${currentTimestamp}'
             WHERE chat_id IN (
                 SELECT chat.id
                 FROM chat
                 INNER JOIN product ON chat.product_id = product.id
                 WHERE product.id = '${productId}'
            )`
        );
    }

    public async softDeleteByProductIds(productIds: string[]): Promise<void> {
        const currentTimestamp = new Date().toISOString();
        const productIdsForInsert = productIds.map((productId) => `'${productId}'`).join(', ');

        await this.query(
            `UPDATE user_chat
             SET deleted_at = '${currentTimestamp}'
             WHERE chat_id IN (
                 SELECT chat.id
                 FROM chat
                 INNER JOIN product ON chat.product_id = product.id
                 WHERE product.id IN (${productIdsForInsert})
            )`
        );
    }
}