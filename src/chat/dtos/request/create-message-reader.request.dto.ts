import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMessageReaderRequestDto {
    @IsNotEmpty()
    @IsString()
    public messageId: string;

    @IsNotEmpty()
    @IsString()
    public readerId: string;
}
