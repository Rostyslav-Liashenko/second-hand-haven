import { Injectable } from '@nestjs/common';
import { BaseService } from '../../core/services/base.service';
import { UnitOfWorkService } from '../../core/services/unit-of-work.service';
import { CreateChatRequestDto } from '../dtos/request/create-chat.request.dto';
import { Chat } from '../entities/chat.entity';
import { ChatResponseDto } from '../dtos/response/chat.response.dto';
import { InvalidCredentialsException } from '../../core/exceptions/invalid-credentials.exception';
import { ChatUnreadMessageResponseDto } from '../dtos/response/chat-unread-message.response.dto';
import { DuplicateChatException } from '../exceptions/duplicate-chat.exception';
import { ChatWithLastMessage } from '../types/chat-with-last-message.type';

@Injectable()
export class ChatService extends BaseService {
    constructor(
        protected readonly unitOfWork: UnitOfWorkService,
    ) {
        super(unitOfWork);
    }

    public async getChatsByUserId(userId: string): Promise<ChatUnreadMessageResponseDto[]> {
        const chats = await this.unitOfWork.chatRepository.findChatIncludeUnreadMessagesByUserId(userId);
        const chatWithLastMessage = chats as ChatWithLastMessage[];

        return chatWithLastMessage.map((chat) => Chat.toChatWithLastMessage(chat));
    }

    public async findChatIdsByUserId(userId: string): Promise<string[]> {
        const chats = await this.unitOfWork.chatRepository.findByUserId(userId);

        return chats.map((chat) => chat.id);
    }

    public async create(createChatRequestDto: CreateChatRequestDto): Promise<ChatResponseDto> {
        const work = async () => {
            const chatFromDto = Chat.fromCreateChatDto(createChatRequestDto);
            const isChatFromDtoValid = this.isChatValid(createChatRequestDto);
            const duplicateChat = await this.findDuplicate(createChatRequestDto);

            if (!isChatFromDtoValid) {
                throw new InvalidCredentialsException();
            }

            if (duplicateChat) {
                throw new DuplicateChatException(duplicateChat.id);
            }

            const chat = await this.unitOfWork.chatRepository.save(chatFromDto);
            chat.userChats = await this.unitOfWork.userChatRepository.findUserChatsByChatId(chat.id);

            return Chat.toDto(chat);
        }

        return await this.unitOfWork.doWork(work);
    }

    private isChatValid(createChatRequestDto: CreateChatRequestDto): boolean {
        const firstParticipant = createChatRequestDto.participants[0];
        const secondParticipant = createChatRequestDto.participants[1];

        const isUserIdDifferent = firstParticipant.userId !== secondParticipant.userId;
        const isChatRoleDifferent = firstParticipant.role !== secondParticipant.role;

        return isUserIdDifferent && isChatRoleDifferent;
    }

    private async findDuplicate(createChatRequestDto: CreateChatRequestDto): Promise<Chat> {
        return await this.unitOfWork.chatRepository.findByCreateChatRequest(createChatRequestDto);
    }
}