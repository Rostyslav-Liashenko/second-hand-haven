import { CustomRepository } from '../../typeorm-ex/typeorm-ex.decorator';
import { MessageReader } from '../entities/message-reader.entity';
import { BaseRepository } from '../../core/repositories/base.repository';
import { CreateMessageReaderRequestDto } from '../dtos/request/create-message-reader.request.dto';


@CustomRepository(MessageReader)
export class MessageReaderRepository extends BaseRepository<MessageReader> {
    public async batchInsert(createMessageReaders: CreateMessageReaderRequestDto[]): Promise<void> {
        const insertValue = createMessageReaders.map(
            (createMessageReader) => `('${createMessageReader.messageId}', '${createMessageReader.readerId}')`
        ).join(',');

        await this.query(
            `INSERT INTO message_reader (message_id, reader_id) VALUES ${insertValue}`
        );
    }

    public async deleteByProductId(productId: string): Promise<void> {
        await this.query(
            `DELETE FROM message_reader
             WHERE message_id IN (
                 SELECT message.id
                 FROM message
                          INNER JOIN chat ON message.chat_id = chat.id
                          INNER JOIN product ON chat.product_id = product.id
                 WHERE product.id = '${productId}'
             )`
        );
    }

    public async softDeleteByProductId(productId: string): Promise<void> {
        const currentTimestamp = new Date().toISOString();

        await this.query(
            `UPDATE message_reader
            SET deleted_at = '${currentTimestamp}'
            WHERE message_id IN (
                 SELECT message.id
                 FROM message
                          INNER JOIN chat ON message.chat_id = chat.id
                          INNER JOIN product ON chat.product_id = product.id
                 WHERE product.id = '${productId}'
            )`
        );
    }

    public async softDeleteByProductIds(productIds: string[]): Promise<void> {
        const currentTimestamp = new Date().toISOString();
        const productIdsForInsert = productIds.map((productId) => `'${productId}'`).join(', ');

        await this.query(
            `UPDATE message_reader
            SET deleted_at = '${currentTimestamp}'
            WHERE message_id IN (
                 SELECT message.id
                 FROM message
                          INNER JOIN chat ON message.chat_id = chat.id
                          INNER JOIN product ON chat.product_id = product.id
                 WHERE product.id IN (${productIdsForInsert})
            )`
        );
    }
}