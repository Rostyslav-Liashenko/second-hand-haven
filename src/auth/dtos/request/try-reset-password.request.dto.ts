import { IsString, Matches } from 'class-validator';
import { emailPattern } from '../../../constans/constans';

export class TryResetPasswordRequestDto {
    @IsString()
    @Matches(emailPattern)
    public email: string;
}
