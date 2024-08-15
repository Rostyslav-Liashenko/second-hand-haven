import { CustomRepository } from '../../typeorm-ex/typeorm-ex.decorator';
import { Chat } from '../entities/chat.entity';
import { BaseRepository } from '../../core/repositories/base.repository';
import { CreateChatRequestDto } from '../dtos/request/create-chat.request.dto';
import { Message } from '../entities/message.entity';
import { PriceOffer } from '../../price-offer/entities/price-offer.entity';
import { messageTypesRelatedWithPriceOffer } from '../constants/constants';

@CustomRepository(Chat)
export class ChatRepository extends BaseRepository<Chat> {
    public async findByCreateChatRequest(createChatRequest: CreateChatRequestDto): Promise<Chat> {
        const participantConditions = createChatRequest.participants.map((participant, index) =>
            `(participant${index}.user.id = '${participant.userId}' and participant${index}.role = '${participant.role}')`);

        return this.createQueryBuilder('chat')
            .innerJoin('chat.userChats', 'participant0')
            .innerJoin('chat.userChats', 'participant1')
            .where('chat.product.id = :productId', {productId: createChatRequest.productId})
            .andWhere(`(${participantConditions.join(' AND ')})`)
            .getOne();
    }

    public async findByUserId(userId: string): Promise<Chat[]> {
        const subQuery = this.manager
            .createQueryBuilder()
            .select('chat.id')
            .from(Chat, 'chat')
            .innerJoin('chat.userChats', 'userChat')
            .where(`userChat.user.id = '${userId}'`);

        return this.createQueryBuilder('chat')
            .leftJoinAndSelect(
                'chat.userChats',
                'userChat',
                `chat.id IN (${subQuery.getQuery()})`
            )
            .innerJoinAndSelect('chat.product', 'product')
            .innerJoinAndSelect('userChat.user', 'user')
            .getMany();
    }

    public async findByProductIdAndUserId(productId: string, userId: string): Promise<Chat> {
        const subQuery = this.manager
            .createQueryBuilder()
            .select('chat.id')
            .from(Chat, 'chat')
            .innerJoin('chat.userChats', 'userChat')
            .where(`userChat.user.id = '${userId}'`)

        return this.createQueryBuilder('chat')
            .leftJoinAndSelect(
                'chat.userChats',
                'userChat',
                `chat.id IN (${subQuery.getQuery()})`
            )
            .innerJoinAndSelect('chat.product', 'product')
            .innerJoinAndSelect('userChat.user', 'user')
            .where(`product.id = '${productId}'`)
            .getOne()
    }

    public async findChatIncludeUnreadMessagesByUserId(userId: string): Promise<Chat[]> {
        const chatByParticipateQuery = this.manager
            .createQueryBuilder()
            .select('chat.id')
            .from(Chat, 'chat')
            .innerJoin('chat.userChats', 'userChat')
            .where(`userChat.user.id = '${userId}'`);

        const readMessageIdsQuery = this.manager
            .createQueryBuilder()
            .select('message.id')
            .from(Message, 'message')
            .innerJoin('message.chat', 'chat')
            .innerJoin('chat.userChats', 'userChat')
            .innerJoin('message.messageReaders', 'messageReader')
            .innerJoin('messageReader.reader', 'subReader')
            .where(`userChat.user.id = '${userId}'`)
            .andWhere(`subReader.user.id = '${userId}'`);

        const unreadMessageQuery = this.manager
            .createQueryBuilder()
            .select('message.id')
            .from(Message, 'message')
            .innerJoin('message.chat', 'chat')
            .innerJoin('chat.userChats', 'userChat')
            .where(`userChat.user.id = '${userId}'`)
            .andWhere(`message.id NOT IN (${readMessageIdsQuery.getQuery()})`)
            .orderBy('message.createdAt');

        const lastMessagesSubQuery = this.manager
            .createQueryBuilder()
            .select('message.id')
            .from(Chat, 'chat')
            .innerJoin(Message, 'message', 'chat.id = message.chat_id')
            .where('message.created_at = (SELECT MAX(created_at) FROM message WHERE message.chat_id = chat.id)');

        return this.createQueryBuilder('chat')
            .leftJoinAndSelect(
                'chat.userChats',
                'userChat',
                `chat.id IN (${chatByParticipateQuery.getQuery()})`
            )
            .leftJoinAndSelect(
                'chat.messages',
                'message',
                `message.id IN (${unreadMessageQuery.getQuery()})`
            )
            .leftJoinAndMapOne(
                'chat.lastMessage',
                Message,
                'lastMessage',
                `lastMessage.id IN (${lastMessagesSubQuery.getQuery()}) AND lastMessage.chat.id = chat.id`,
            )
            .leftJoinAndSelect('lastMessage.userChat', 'lastMessageOwner')
            .leftJoinAndSelect('message.userChat', 'ownerMessage')
            .leftJoinAndMapOne(
                'message.priceOffer',
                PriceOffer,
                'priceOffer', 'message.entityId = priceOffer.id AND message.type IN (:...types)',
                {types: messageTypesRelatedWithPriceOffer}
            )
            .leftJoinAndSelect('priceOffer.buyer', 'buyer')
            .leftJoinAndSelect('priceOffer.product', 'productPriceOffer')
            .innerJoinAndSelect('chat.product', 'product')
            .innerJoinAndSelect('userChat.user', 'user')
            .getMany();
    }

    public async deleteByProductId(productId: string): Promise<void> {
        await this.createQueryBuilder('chat')
            .innerJoinAndSelect('chat.product', 'product')
            .where('product.id = :productId', {productId})
            .delete()
            .execute();
    }

    public async softDeleteByProductId(productId: string): Promise<void> {
        await this.createQueryBuilder('chat')
            .innerJoinAndSelect('chat.product', 'product')
            .softDelete()
            .where('product.id = :productId', {productId})
            .execute();
    }

    public async softDeleteByProductIds(productIds: string[]): Promise<void> {
        await this.createQueryBuilder('chat')
            .innerJoinAndSelect('chat.product', 'product')
            .softDelete()
            .where('product.id IN (:...productIds)', {productIds})
            .execute();
    }
}