import { Injectable } from '@nestjs/common';
import { RegistrationMailRequestDto } from '../dtos/request/registration-mail.request.dto';


@Injectable()
export class MailingService {

    constructor() {}

    public async registrationEmail(registrationMail: RegistrationMailRequestDto): Promise<void> {
       console.log(`add new user with ${registrationMail.email}`);
    }
}
