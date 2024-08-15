import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { Message } from './message.entity';
import { UserChat } from './user-chat.entity';
import { CreateMessageRequestDto } from '../dtos/request/create-message.request.dto';


@Entity({name: 'message_reader'})
export class MessageReader extends BaseEntity {

    @ManyToOne(() => Message, (message) => message.messageReaders)
    @JoinColumn({name: 'message_id'})
    public message: Message;


    @ManyToOne(() => UserChat, (userChat) => userChat.messageReader)
    @JoinColumn({name: 'reader_id'})
    public reader: UserChat;

    public static fromCreateMessageRequestDto(createMessageRequest: CreateMessageRequestDto): MessageReader {
        const messageReader = new MessageReader();

        messageReader.reader = { id: createMessageRequest.messageOwnerId } as UserChat;

        return messageReader
    }
}