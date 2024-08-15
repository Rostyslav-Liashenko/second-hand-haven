import { IsNotEmpty, IsString, IsUUID } from 'class-validator';


export class CreateMessageRequestDto {
    @IsNotEmpty()
    @IsUUID()
    public chatId: string;

    @IsNotEmpty()
    @IsUUID()
    public messageOwnerId: string;

    @IsNotEmpty()
    @IsString()
    public text: string;
}
