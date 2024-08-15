import { UserChatResponseDto } from './user-chat.response.dto';
import { MessageResponseDto } from './message.response.dto';

export class ChatUnreadMessageResponseDto {
    public id: string;
    public productId: string;
    public participants: UserChatResponseDto[];
    public unreadMessages: MessageResponseDto[];
}
