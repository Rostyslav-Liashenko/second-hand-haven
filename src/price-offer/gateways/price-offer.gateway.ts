import { config } from 'dotenv';
import * as process from 'node:process';
import { UseFilters } from '@nestjs/common';
import { CustomIoSocketExceptionFilter } from '../../core/exception-filters/custom-io-socket-exception-filter';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { CreatePriceOfferRequestDto } from '../dtos/request/create-price-offer.request.dto';
import { UpdatePriceOfferRequestDto } from '../dtos/request/update-price-offer.request.dto';
import { PriceOfferService } from '../services/price-offer.service';
import { Server, Socket } from 'socket.io';
import { ChatEvent } from '../../chat/enums/chat-event.enum';
import { PriceOfferEvent } from '../enums/price-offer-event.enum';
import { NotificationEvent } from '../../notification/enums/notification-event.enum';
import {
    CreateNotificationPriceOfferResponseDto
} from '../../notification/dtos/response/create-notification-price-offer.response.dto';
import { UpdatePriceOfferResponseDto } from '../dtos/response/update-price-offer.response.dto';
import {
    CreateAndUpdatePriceOfferWithMessageAndNotificationResponseDto
} from '../dtos/response/create-and-update-price-offer-with-message-and-notification.response.dto';
config();

const productOfferPort = Number.parseInt(process.env.WEBSOCKET_PORT);
const cors = { origin: [process.env.SITE_URL] };

@UseFilters(CustomIoSocketExceptionFilter)
@WebSocketGateway(productOfferPort, {cors})
export class PriceOfferGateway {
    @WebSocketServer()
    private server: Server;

    constructor(private readonly priceOfferService: PriceOfferService) {}

    @SubscribeMessage(PriceOfferEvent.CREATE)
    public async create(
        @MessageBody() createProductOfferRequestDto: CreatePriceOfferRequestDto,
        @ConnectedSocket() client: Socket,
    ): Promise<void> {
        const createProductOfferResponseDto = await this.priceOfferService.createWithMessageAndNotificationAndTryAutomateUpdate(createProductOfferRequestDto);
        this.sendCreateEvent(createProductOfferResponseDto, client);
    }

    @SubscribeMessage(PriceOfferEvent.UPDATE)
    public async update(
        @MessageBody() updateProductOfferRequestDto: UpdatePriceOfferRequestDto,
    ): Promise<void> {
        const updatePriceOfferResponseDto = await this.priceOfferService.update(updateProductOfferRequestDto);
        this.sendUpdateEvent(updatePriceOfferResponseDto);
    }

    private sendCreateEvent(
        createAndUpdatePriceOfferWithMessageAndNotificationResponseDto: CreateAndUpdatePriceOfferWithMessageAndNotificationResponseDto,
        client: Socket,
    ): void {
        const {
            messageResponseDto,
            createNotificationPriceOfferResponseDto,
            updatePriceOfferResponseDto,
        } = createAndUpdatePriceOfferWithMessageAndNotificationResponseDto;

        const socketRoom = messageResponseDto.chatId;

        this.sendPostNotificationSuccess(createNotificationPriceOfferResponseDto);
        this.server.to(socketRoom).emit(ChatEvent.RECEIVED_MESSAGE, messageResponseDto);
        client.emit(PriceOfferEvent.SUCCESS_CREATE);

        if (!updatePriceOfferResponseDto) return;

        this.sendUpdateEvent(updatePriceOfferResponseDto);
    }

    private sendUpdateEvent(updatePriceOfferResponseDto: UpdatePriceOfferResponseDto): void {
        const { messageResponseDto, priceOfferResponseDto, createNotificationProductOfferResponseDto } = updatePriceOfferResponseDto;
        const socketRoom = messageResponseDto.chatId;

        this.sendPostNotificationSuccess(createNotificationProductOfferResponseDto);
        this.server.to(socketRoom).emit(ChatEvent.RECEIVED_MESSAGE, messageResponseDto);
        this.server.to(socketRoom).emit(PriceOfferEvent.SUCCESS_UPDATE, priceOfferResponseDto);
    }

    private sendPostNotificationSuccess(
        createNotificationProductOfferResponseDto: CreateNotificationPriceOfferResponseDto
    ): void {
        const { notificationRecipients } = createNotificationProductOfferResponseDto;
        const recipientIds = notificationRecipients.map((notificationRecipients) => notificationRecipients.recipient.id);

        this.server.to(recipientIds).emit(
            NotificationEvent.POST_NOTIFICATION_SUCCESS,
            createNotificationProductOfferResponseDto
        );
    }
}
