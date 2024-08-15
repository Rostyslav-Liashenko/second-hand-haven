import { UserResponseDto } from '../../../user/dtos/response/user.response.dto';
import { UserChatRole } from '../../enums/user-chat-role.enum';


export class UserChatResponseDto {
    public id: string;
    public user: UserResponseDto;
    public role: UserChatRole;
}
