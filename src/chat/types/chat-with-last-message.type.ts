import { Message } from '../entities/message.entity';
import { Chat } from '../entities/chat.entity';

export type ChatWithLastMessage = Chat & {
    lastMessage: Message
};
