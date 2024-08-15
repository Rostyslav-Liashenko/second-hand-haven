import { IsNotEmpty, Matches } from 'class-validator';
import { emailPattern } from '../../../constans/constans';


export class RegistrationMailRequestDto {
    @IsNotEmpty()
    @Matches(emailPattern)
    public email: string;
}
