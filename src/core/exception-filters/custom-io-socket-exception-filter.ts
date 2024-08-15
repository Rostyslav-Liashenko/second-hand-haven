import { ArgumentsHost, Catch } from '@nestjs/common';
import { Socket } from 'socket.io';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { ChatEvent } from '../../chat/enums/chat-event.enum';
import { DuplicateChatException } from '../../chat/exceptions/duplicate-chat.exception';
import { DuplicateChatResponseDto } from '../../chat/dtos/response/duplicate-chat.response.dto';

@Catch()
export class CustomIoSocketExceptionFilter extends BaseWsExceptionFilter {
    public catch(exception: WsException, host: ArgumentsHost): void {
        const client = host.switchToWs().getClient() as Socket;
        const errorMessage = exception.message;


        if (exception instanceof DuplicateChatException) {
            const chatId = exception.chatId;
            const duplicateChatResponseDto: DuplicateChatResponseDto = { chatId: chatId };
            client.emit(ChatEvent.ERROR_DUPLICATE_CHAT, duplicateChatResponseDto);

            return ;
        }

        client.emit(ChatEvent.ERROR, {
            clientId: client.id,
            message: errorMessage,
        });
    }
}