import { IsBoolean, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { emailPattern, passwordPattern } from '../../../constans/constans';

export class AdminRegistrationRequestDto {
    @IsNotEmpty()
    @IsString()
    @Matches(emailPattern)
    @MaxLength(250)
    public email: string;

    @IsNotEmpty()
    @IsString()
    @Matches(passwordPattern)
    @MaxLength(250)
    public password: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    public firstName: string;

    @IsNotEmpty()
    @IsBoolean()
    public isEmailSubscribe: boolean;
}
