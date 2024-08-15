import { UserChatRequestDto } from './user-chat.request.dto';
import { ArrayMinSize, IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateChatRequestDto {
    @IsNotEmpty()
    @IsUUID()
    public productId: string;

    @IsArray()
    @ArrayMinSize(2)
    public participants: UserChatRequestDto[];
}
