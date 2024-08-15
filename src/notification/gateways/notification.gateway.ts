import { UseFilters } from '@nestjs/common';
import { CustomIoSocketExceptionFilter } from '../../core/exception-filters/custom-io-socket-exception-filter';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import * as process from 'node:process';
import { NotificationEvent } from '../enums/notification-event.enum';
import { GetNotificationRequestDto } from '../dtos/request/get-notification.request.dto';
import { Socket } from 'socket.io';
import { NotificationService } from '../services/notification.service';
import { ReadNotificationRequestDto } from '../dtos/request/read-notification.request.dto';
import { ReadNotificationResponseDto } from '../dtos/response/read-notification.response.dto';

const notificationPort = Number.parseInt(process.env.WEBSOCKET_PORT);
const cors = { origin: [process.env.SITE_URL] };

@UseFilters(CustomIoSocketExceptionFilter)
@WebSocketGateway(notificationPort, {cors})
export class NotificationGateway {
    constructor(private readonly notificationService: NotificationService) {}

    @SubscribeMessage(NotificationEvent.GET_NOTIFICATION_BY_ID)
    public async getNotificationByUserId(
        @MessageBody() getNotificationRequestDto: GetNotificationRequestDto,
        @ConnectedSocket() client: Socket,
    ): Promise<void> {
        const { userId } = getNotificationRequestDto;
        const notificationPriceOfferResponseDtos = await this.notificationService.getCreateNotificationPriceOfferResponseDto(userId);

        client.emit(NotificationEvent.GET_NOTIFICATION_BY_ID_SUCCESS, notificationPriceOfferResponseDtos);
    }

    @SubscribeMessage(NotificationEvent.DELETE_NOTIFICATION_BY_ID)
    public async deleteNotificationById(
        @MessageBody() deleteNotificationRequestDto: { notificationId: string },
        @ConnectedSocket() client: Socket,
    ): Promise<void> {
        const { notificationId } = deleteNotificationRequestDto;
        await this.notificationService.deleteById(notificationId);

        client.emit(NotificationEvent.DELETE_NOTIFICATION_BY_ID_SUCCESS, { notificationId });
    }

    @SubscribeMessage(NotificationEvent.READ_NOTIFICATION)
    public async readNotifications(
        @MessageBody() readNotificationRequestDto: ReadNotificationRequestDto,
        @ConnectedSocket() client: Socket,
    ): Promise<void> {
        await this.notificationService.read(readNotificationRequestDto);

        const readNotificationResponseDto: ReadNotificationResponseDto = {
            ...readNotificationRequestDto,
        };

        client.emit(NotificationEvent.READ_NOTIFICATION_SUCCESS, readNotificationResponseDto);
    }
}
