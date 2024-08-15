import { UserResponseDto } from '../../../user/dtos/response/user.response.dto';

export class NotificationRecipientResponseDto {
    public recipient: UserResponseDto
    public isRead: boolean
}
