import { UserChatRole } from '../../enums/user-chat-role.enum';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

export class UserChatRequestDto {
    @IsNotEmpty()
    @IsUUID()
    public userId: string

    @IsNotEmpty()
    @IsEnum(UserChatRole)
    public role: UserChatRole
}
