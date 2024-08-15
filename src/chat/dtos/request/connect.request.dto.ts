import { IsNotEmpty, IsUUID } from 'class-validator';

export class ConnectRequestDto {
    @IsNotEmpty()
    @IsUUID()
    public userId: string;
}
