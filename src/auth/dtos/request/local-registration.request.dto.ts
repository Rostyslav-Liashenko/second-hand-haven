import { IsBoolean, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import {
    emailPattern,
    passwordPattern,
} from '../../../constans/constans';

export class LocalRegistrationRequestDto {
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
    public lastName: string;

    @IsNotEmpty()
    @MinLength(12)
    @MaxLength(12)
    public phoneNumber: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(1000)
    public addressLine: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(500)
    public city: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(10)
    public zipCode: string;

    @IsString()
    @MaxLength(24)
    @MinLength(16)
    public number: string;

    @IsString()
    @MinLength(3)
    @MaxLength(3)
    public cvv: string;

    @IsString()
    @MinLength(2)
    @MaxLength(2)
    public expireYear: string;

    @IsString()
    @MinLength(2)
    @MaxLength(2)
    public expireMonth: string;

    @IsNotEmpty()
    @IsString()
    public firstName: string;

    @IsNotEmpty()
    @IsBoolean()
    public isEmailSubscribe: boolean;

    @IsString()
    public tokenId: string;
}
