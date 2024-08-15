import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { emailPattern } from '../../../constans/constans';

export class UpdatePersonalSettingCreatedUserRequestDto {
    @IsNotEmpty()
    @IsString()
    @Matches(emailPattern)
    @MaxLength(250)
    public email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    public firstName: string;

    @IsNotEmpty()
    @IsString()
    public lastName: string;

    @IsNotEmpty()
    @MinLength(7)
    @MaxLength(8)
    public phoneNumber: string;

    @IsString()
    public aboutMe: string;
}
