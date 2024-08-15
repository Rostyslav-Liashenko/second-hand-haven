import { IsString, Matches, MaxLength } from 'class-validator';
import { passwordPattern } from '../../../constans/constans';


export class UpdatePasswordRequestDto {
    @IsString()
    @MaxLength(250)
    @Matches(passwordPattern)
    public password: string;
}