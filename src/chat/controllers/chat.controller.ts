import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import { ChatUnreadMessageResponseDto } from '../dtos/response/chat-unread-message.response.dto';
import { SameUserGuard } from '../../core/guards/same-user.guard';
import { SameUser } from '../../core/decorators/same-user.decorator';
import { RequestObjectType } from '../../core/enums/request-object-type.enum';


@ApiTags('chats')
@Controller('chats')
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Get('user-chat/user/:id')
    @SameUser({
        requestObjectType: RequestObjectType.PARAM
    })
    @UseGuards(SameUserGuard)
    public async getByUserId(@Param('id') userId: string): Promise<ChatUnreadMessageResponseDto[]> {
        return this.chatService.getChatsByUserId(userId);
    }
}