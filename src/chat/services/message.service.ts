import { Injectable } from '@nestjs/common';
import { BaseService } from '../../core/services/base.service';
import { UnitOfWorkService } from '../../core/services/unit-of-work.service';
import { CreateMessageRequestDto } from '../dtos/request/create-message.request.dto';
import { Message } from '../entities/message.entity';
import { MessageResponseDto } from '../dtos/response/message.response.dto';
import { ChatPaginationRequestDto } from '../dtos/request/chat-pagination.request.dto';
import { MessageReader } from '../entities/message-reader.entity';
import { ChatPaginationResponseDto } from '../dtos/response/chat-pagination.response.dto';
import { NotFoundException } from '../../core/exceptions/not-found.exception';
import { MessageType } from '../enums/message-type.enum';
import { CreateMessageWithEntityIdRequestDto } from '../dtos/request/create-message-with-entity-id.request.dto';
import { MessageWithPriceOffer } from '../types/message-with-price-offer.type';
import { PriceOffer } from '../../price-offer/entities/price-offer.entity';

@Injectable()
export class MessageService extends BaseService {
    constructor(
        protected readonly unitOfWork: UnitOfWorkService
    ) {
        super(unitOfWork);
    }

    public async findChatPagination(
        messagePaginationRequestDto: ChatPaginationRequestDto,
    ): Promise<ChatPaginationResponseDto> {
        const messageBuilder = await this.unitOfWork.messageRepository.findMessagePaginationBuilder(messagePaginationRequestDto);
        const totalQuantityMessage = await messageBuilder.getCount();
        const { entities: messages } = await messageBuilder.getRawAndEntities();

        const hasMoreMessage = totalQuantityMessage > messages.length;
        const messagesWithPriceOffer = messages as MessageWithPriceOffer[];

        return  {
            chatId: messagePaginationRequestDto.chatId,
            hasMoreMessage,
            messages: messagesWithPriceOffer.map((messageWithPriceOffer) => Message.toDto(messageWithPriceOffer))
        }
    }

    public async create(createMessageRequestDto: CreateMessageRequestDto): Promise<MessageResponseDto> {
        const work = async () => {
            const messageFromDto = Message.fromCreateDto(createMessageRequestDto);
            const messageReader = MessageReader.fromCreateMessageRequestDto(createMessageRequestDto);
            messageFromDto.messageReaders = [messageReader];

            const message = await this.unitOfWork.messageRepository.save(messageFromDto);
            const messageWithPriceOffer = message as MessageWithPriceOffer;

            return Message.toDto(messageWithPriceOffer);
        }

        return await this.unitOfWork.doWork(work);
    }

    public async createExpectOfferMessage(
        productId: string,
        buyerId: string,
        price: number,
        entityId: string,
        priceOffer: PriceOffer,
    ): Promise<MessageResponseDto> {
        const work = async () => {
            const product = await this.unitOfWork.productRepository.findById(productId);

            if (!product) {
                throw new NotFoundException();
            }

            const text = `Offer was sent: ${price} kr. ${product.price} kr.`;

            return await this.createOfferMessage(productId, buyerId, MessageType.EXPECTED_OFFER, text, entityId, priceOffer);
        };

        return await this.unitOfWork.doWork(work);
    }

    public async createApproveOfferMessage(
        productId: string,
        price: number,
        entityId: string,
        priceOffer: PriceOffer,
    ): Promise<MessageResponseDto> {
        const work = async () => {
            const text = `The seller approved your offer: ${price} kr.`;
            const seller = await this.unitOfWork.userRepository.findOwnerByProductId(productId);

            return await this.createOfferMessage(productId, seller.id, MessageType.APPROVED_OFFER, text, entityId, priceOffer);
        };

        return await this.unitOfWork.doWork(work);
    }

    public async createRejectOfferMessage(
        productId: string,
        price: number,
        entityId: string,
        priceOffer: PriceOffer,
    ): Promise<MessageResponseDto> {
        const work = async () => {
            const text = `The seller rejected you offer: ${price} kr.`;
            const seller = await this.unitOfWork.userRepository.findOwnerByProductId(productId);

            return await this.createOfferMessage(productId, seller.id, MessageType.REJECTED_OFFER, text, entityId, priceOffer);
        };

        return await this.unitOfWork.doWork(work);
    }

    private async createOfferMessage(
        productId: string,
        readerId: string,
        messageType: MessageType,
        text: string,
        entityId: string,
        priceOffer: PriceOffer,
    ): Promise<MessageResponseDto> {
        const chat = await this.unitOfWork.chatRepository.findByProductIdAndUserId(productId, readerId);

        if (!chat) throw new NotFoundException();

        const messageOwner = chat.userChats.find((userChat) => userChat.user.id === readerId);

        if (!messageOwner) throw new NotFoundException();

        const createMessageRequestDto: CreateMessageWithEntityIdRequestDto = {
            chatId: chat.id,
            messageOwnerId: messageOwner.id,
            type: messageType,
            text,
            entityId,
        };

        const messageFromDto = Message.fromCreateMessageWithEntityId(createMessageRequestDto);
        messageFromDto.messageReaders = [];
        const message = await this.unitOfWork.messageRepository.save(messageFromDto);
        const messageWithPriceOffer = message as MessageWithPriceOffer;
        messageWithPriceOffer.priceOffer = priceOffer;

        return Message.toDto(messageWithPriceOffer);
    }
}
