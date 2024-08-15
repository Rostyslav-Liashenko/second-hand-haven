import { Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { Message } from './message.entity';
import { Product } from '../../product/entities/product.entity';
import { UserChat } from './user-chat.entity';
import { CreateChatRequestDto } from '../dtos/request/create-chat.request.dto';
import { ChatResponseDto } from '../dtos/response/chat.response.dto';
import { ChatUnreadMessageResponseDto } from '../dtos/response/chat-unread-message.response.dto';
import { ChatWithLastMessageResponseDto } from '../dtos/response/chat-with-last-message.response.dto';
import { ChatWithLastMessage } from '../types/chat-with-last-message.type';

@Entity({name: 'chat'})
export class Chat extends BaseEntity {
    @ManyToOne(() => Product, (product) => product.chats)
    @JoinColumn({name: 'product_id'})
    public product: Product;

    @OneToMany(() => Message, (message) => message.chat)
    public messages: Message[];

    @OneToMany(() => UserChat, (userChat) => userChat.chat, {cascade: true})
    public userChats: UserChat[];

    public static fromCreateChatDto(createChatRequestDto: CreateChatRequestDto): Chat {
        const chat = new Chat();

        chat.product = { id: createChatRequestDto.productId } as Product;
        chat.messages = [];
        chat.userChats = createChatRequestDto.participants.map((participant) => UserChat.fromDto(participant));

        return chat;
    }

    public static toChatUnreadMessageDto(chat: Chat): ChatUnreadMessageResponseDto {
        return {
            id: chat.id,
            productId: chat.product.id,
            participants: (chat.userChats || []).map((userChat) => UserChat.toDto(userChat)),
            unreadMessages: (chat.messages || []).map((message) => Message.toDtoByChatId(message, chat.id)),
        }
    }

    public static toChatWithLastMessage(chat: ChatWithLastMessage): ChatWithLastMessageResponseDto {
        return {
            id: chat.id,
            productId: chat.product.id,
            participants: (chat.userChats || []).map((userChat) => UserChat.toDto(userChat)),
            unreadMessages: (chat.messages || []).map((message) => Message.toDtoByChatId(message, chat.id)),
            lastMessage: chat.lastMessage ? Message.toDtoByChatId(chat.lastMessage, chat.id) : null,
        }
    }

    public static toDto(chat: Chat): ChatResponseDto {
        return {
            id: chat.id,
            productId: chat.product.id,
            participants: (chat.userChats || []).map((userChat) => UserChat.toDto(userChat)),
        }
    }
}