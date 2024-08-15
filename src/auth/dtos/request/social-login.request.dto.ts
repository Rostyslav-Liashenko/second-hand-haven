import { IsBoolean, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { emailPattern } from '../../../constans/constans';

export class SocialLoginRequestDto {
    @IsNotEmpty()
    @IsString()
    public socialId: string;

    @IsNotEmpty()
    @IsString()
    @Matches(emailPattern)
    @MaxLength(250)
    public email: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    public firstName: string;

    @IsString()
    public lastName: string;

    @IsOptional()
    @IsString()
    public imageUrl?: string;

    @IsNotEmpty()
    @IsBoolean()
    public isConfirm: boolean;

    @IsNotEmpty()
    @IsBoolean()
    public isEmailSubscribe: boolean;

    @IsNotEmpty()
    @IsBoolean()
    public isEmailConfirm: boolean;

    @IsNotEmpty()
    @IsBoolean()
    public isAccordingTermUse: boolean;
}