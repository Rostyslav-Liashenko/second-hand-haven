import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';
import { emailPattern } from '../../../constans/constans';

export class LocalLoginRequestDto {
    @IsNotEmpty()
    @IsString()
    @Matches(emailPattern)
    @MaxLength(250)
    public email: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(250)
    public password: string;
}