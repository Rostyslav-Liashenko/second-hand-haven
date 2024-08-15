import { UserChatResponseDto } from './user-chat.response.dto';

export class ChatResponseDto {
    public id: string;
    public productId: string;
    public participants: UserChatResponseDto[];
}