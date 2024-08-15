import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class ChatPaginationRequestDto {
    @IsNotEmpty()
    @IsUUID()
    public chatId: string;

    public time: Date;

    @IsNotEmpty()
    @IsNumber()
    public quantity: number;
}
