import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { MessageType } from '../../enums/message-type.enum';

export class CreateMessageWithEntityIdRequestDto {
    @IsNotEmpty()
    @IsUUID()
    public chatId: string;

    @IsNotEmpty()
    @IsUUID()
    public messageOwnerId: string;

    @IsNotEmpty()
    @IsString()
    public text: string;

    @IsUUID()
    public entityId: string;

    @IsNotEmpty()
    @IsEnum(MessageType)
    public type: MessageType;
}
