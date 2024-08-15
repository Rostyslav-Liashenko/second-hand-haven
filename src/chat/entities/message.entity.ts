import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { Chat } from './chat.entity';
import { UserChat } from './user-chat.entity';
import { CreateMessageRequestDto } from '../dtos/request/create-message.request.dto';
import { MessageResponseDto } from '../dtos/response/message.response.dto';
import { MessageReader } from './message-reader.entity';
import { MessageType } from '../enums/message-type.enum';
import { CreateMessageWithEntityIdRequestDto } from '../dtos/request/create-message-with-entity-id.request.dto';
import { MessageWithPriceOffer } from '../types/message-with-price-offer.type';
import { PriceOffer } from '../../price-offer/entities/price-offer.entity';

@Entity({name: 'message'})
export class Message extends BaseEntity {
    @ManyToOne(() => Chat, (chat) => chat.messages)
    @JoinColumn({name: 'chat_id'})
    public chat: Chat;

    @ManyToOne(() => UserChat, (userChat) => userChat.messages)
    @JoinColumn({name: 'user_chat_id'})
    public userChat: UserChat;

    @OneToMany(() => MessageReader, (messageReader) => messageReader.message, {cascade: true})
    public messageReaders: MessageReader[];

    @Column({name: 'text', type: 'varchar', length: 500})
    public text: string;

    @Column({
        name: 'entity_id',
        type: 'uuid',
        nullable: true,
    })
    public entityId: string;

    @Column({
        name: 'type',
        type: 'enum',
        enum: MessageType,
        default: MessageType.PLAIN_TEXT,
    })
    public type: MessageType;

    public static fromCreateDto(createMessageRequest: CreateMessageRequestDto): Message {
        const message = new Message();

        message.chat = {id: createMessageRequest.chatId} as Chat;
        message.userChat = {id: createMessageRequest.messageOwnerId} as UserChat;
        message.text = createMessageRequest.text;
        message.type = MessageType.PLAIN_TEXT;

        return message;
    }

    public static fromCreateMessageWithEntityId(
        createMessageWithEntityIdRequestDto: CreateMessageWithEntityIdRequestDto
    ): Message {
        const message = new Message();

        message.chat = { id: createMessageWithEntityIdRequestDto.chatId } as Chat;
        message.userChat = { id: createMessageWithEntityIdRequestDto.messageOwnerId } as UserChat;
        message.text = createMessageWithEntityIdRequestDto.text;
        message.type = createMessageWithEntityIdRequestDto.type;
        message.entityId = createMessageWithEntityIdRequestDto.entityId;

        return message;
    }

    public static toDto(message: MessageWithPriceOffer): MessageResponseDto {
        return {
            id: message.id,
            createdAt: message.createdAt,
            chatId: message.chat.id,
            messageOwnerId: message.userChat.id,
            text: message.text,
            type: message.type,
            priceOffer: message.priceOffer ? PriceOffer.toDto(message.priceOffer) : null,
        }
    }

    public static toDtoByChatId(message: Message, chatId: string): MessageResponseDto {
        return {
            id: message.id,
            createdAt: message.createdAt,
            chatId,
            messageOwnerId: message.userChat.id,
            text: message.text,
            type: message.type,
        }
    }
}
