import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateMessageRequestDto } from '../dtos/request/create-message.request.dto';
import { ConnectRequestDto } from '../dtos/request/connect.request.dto';
import { MessageService } from '../services/message.service';
import { UseFilters } from '@nestjs/common';
import { CustomIoSocketExceptionFilter } from '../../core/exception-filters/custom-io-socket-exception-filter';
import { ChatService } from '../services/chat.service';
import { ChatEvent } from '../enums/chat-event.enum';
import { ChatPaginationRequestDto } from '../dtos/request/chat-pagination.request.dto';
import { CreateMessageReaderRequestDto } from '../dtos/request/create-message-reader.request.dto';
import { MessageReaderService } from '../services/message-reader.service';
import { CreateChatRequestDto } from '../dtos/request/create-chat.request.dto';
import { UserChatRole } from '../enums/user-chat-role.enum';
import { config } from 'dotenv';
import * as process from 'node:process';

config();

const chatPort = Number.parseInt(process.env.WEBSOCKET_PORT);
const cors = { origin: [process.env.SITE_URL] };

@UseFilters(CustomIoSocketExceptionFilter)
@WebSocketGateway(chatPort, {cors})
export class ChatGetaway {
    constructor(
        private readonly chatService: ChatService,
        private readonly messageService: MessageService,
        private readonly messageReaderService: MessageReaderService,
    ) {}

    @WebSocketServer()
    private server: Server;

    @SubscribeMessage(ChatEvent.CREATE_CHAT)
    public async handleCreateChat(
        @MessageBody() createChatRequestDto: CreateChatRequestDto,
    ): Promise<void> {
        const chatResponseDto = await this.chatService.create(createChatRequestDto);
        const seller = chatResponseDto.participants.find((participant) => participant.role === UserChatRole.SELLER);
        const buyer = chatResponseDto.participants.find((participant) => participant.role === UserChatRole.BUYER);

        if (!seller || !buyer) return ;

        const chatId = chatResponseDto.id;
        const sellerUser = seller.user;
        const buyerUser = buyer.user;

        const sellerSockets = await this.server.in(sellerUser.id).fetchSockets();
        const buyerSockets = await this.server.in(buyerUser.id).fetchSockets();

        const sockets = [...sellerSockets, ...buyerSockets];
        sockets.map((socket) => socket.join(chatId));

        this.server.to(chatId).emit(ChatEvent.RECEIVED_CREATE_CHAT, chatResponseDto);
    }

    @SubscribeMessage(ChatEvent.JOIN_CHATS)
    public async handleJoinChats(
        @MessageBody() connectRequestDto: ConnectRequestDto,
        @ConnectedSocket() client: Socket,
    ): Promise<void> {
        const { userId } = connectRequestDto;
        const roomIds = await this.chatService.findChatIdsByUserId(userId);

        client.join(userId);
        client.join(roomIds);

        client.emit(ChatEvent.RECEIVED_JOIN_CHATS);
    }

    @SubscribeMessage(ChatEvent.SEND_MESSAGE)
    public async handleSendMessage(
        @MessageBody() messageRequestDto: CreateMessageRequestDto,
    ): Promise<void> {
        const messageResponseDto = await this.messageService.create(messageRequestDto);
        const socketRoom = messageRequestDto.chatId;

        this.server.to(socketRoom).emit(ChatEvent.RECEIVED_MESSAGE, messageResponseDto);
    }

    @SubscribeMessage(ChatEvent.GET_PAGINATION_MESSAGE)
    public async handleGetPaginationMessage(
        @MessageBody() messagePaginationRequestDto: ChatPaginationRequestDto,
        @ConnectedSocket() client: Socket,
    ): Promise<void> {
        const chatPaginationResponseDto = await this.messageService.findChatPagination(messagePaginationRequestDto);

        client.emit(ChatEvent.RECEIVED_PAGINATION_MESSAGE, chatPaginationResponseDto);
    }

    @SubscribeMessage(ChatEvent.CREATE_MESSAGE_READER)
    public async handleCreateMessageReader(
        @MessageBody() createMessageReaderRequestDtos: CreateMessageReaderRequestDto[]
    ): Promise<void> {
        await this.messageReaderService.create(createMessageReaderRequestDtos);
    }
}