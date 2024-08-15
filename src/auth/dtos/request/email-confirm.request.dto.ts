import { IsNotEmpty, IsString } from 'class-validator';

export class EmailConfirmRequestDto {
    @IsNotEmpty()
    @IsString()
    public token: string;
}