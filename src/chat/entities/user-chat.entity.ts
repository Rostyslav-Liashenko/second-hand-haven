import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../core/entities/base.entity';
import { Chat } from './chat.entity';
import { User } from '../../user/entities/user.entity';
import { Message } from './message.entity';
import { UserChatRole } from '../enums/user-chat-role.enum';
import { UserChatRequestDto } from '../dtos/request/user-chat.request.dto';
import { UserChatResponseDto } from '../dtos/response/user-chat.response.dto';
import { MessageReader } from './message-reader.entity';


@Entity({name: 'user_chat'})
export class UserChat extends BaseEntity {
    @ManyToOne(() => User, (user) => user.userChats)
    @JoinColumn({name: 'user_id'})
    public user: User;

    @ManyToOne(() => Chat, (chat) => chat.userChats)
    @JoinColumn({name: 'chat_id'})
    public chat: Chat;

    @OneToMany(() => Message, (message) => message.userChat)
    public messages: Message[];

    @OneToMany(() => MessageReader, (messageReader) => messageReader.reader)
    public messageReader: MessageReader[];

    @Column({
        name: 'role',
        type: 'enum',
        enum: UserChatRole,
        default: UserChatRole.BUYER,
    })
    public role: UserChatRole;

    public static fromDto(userChatRequestDto: UserChatRequestDto): UserChat {
        const userChat = new UserChat();

        userChat.user = {id: userChatRequestDto.userId} as User;
        userChat.role = userChatRequestDto.role;

        return userChat;
    }

    public static toDto(userChat: UserChat): UserChatResponseDto {
        return userChat && {
            id: userChat.id,
            role: userChat.role,
            user: User.toDto(userChat.user),
        }
    }
}
