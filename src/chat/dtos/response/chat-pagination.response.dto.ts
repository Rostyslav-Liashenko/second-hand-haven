import { MessageResponseDto } from './message.response.dto';


export class ChatPaginationResponseDto {
    public chatId: string;
    public hasMoreMessage: boolean;
    public messages: MessageResponseDto[];
}
