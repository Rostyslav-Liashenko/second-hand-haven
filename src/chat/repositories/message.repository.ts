import { CustomRepository } from '../../typeorm-ex/typeorm-ex.decorator';
import { Message } from '../entities/message.entity';
import { BaseRepository } from '../../core/repositories/base.repository';
import { ChatPaginationRequestDto } from '../dtos/request/chat-pagination.request.dto';
import { SelectQueryBuilder } from 'typeorm';
import { PriceOffer } from '../../price-offer/entities/price-offer.entity';
import { messageTypesRelatedWithPriceOffer } from '../constants/constants';


@CustomRepository(Message)
export class MessageRepository extends BaseRepository<Message> {
    public async findMessagePaginationBuilder(
        messagePagination: ChatPaginationRequestDto
    ): Promise<SelectQueryBuilder<Message>> {

        return this.createQueryBuilder('message')
            .innerJoinAndSelect('message.chat', 'chat')
            .innerJoinAndSelect('message.userChat', 'userChat')
            .where('chat.id = :chatId', {chatId: messagePagination.chatId})
            .andWhere('message.createdAt < :date', {date: messagePagination.time})
            .orderBy('message.createdAt', 'DESC')
            .leftJoinAndMapOne(
                'message.priceOffer',
                PriceOffer,
                'priceOffer', 'message.entityId = priceOffer.id AND message.type IN (:...types)',
                {types: messageTypesRelatedWithPriceOffer}
            )
            .leftJoinAndSelect('priceOffer.buyer', 'buyer')
            .leftJoinAndSelect('priceOffer.product', 'product')
            .limit(messagePagination.quantity);
    }

    public async deleteByProductId(productId: string): Promise<void> {
        await this.query(`DELETE FROM message
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
            `UPDATE message
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
            `UPDATE message
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