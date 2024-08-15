import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MailingService } from '../services/mailing.service';
import { AllowUnauthorized } from '../../auth/decorators/allow-unauthorized.decorator';
import { RegistrationMailRequestDto } from '../dtos/request/registration-mail.request.dto';

@ApiTags('mailing')
@Controller('mailing')
export class MailingController {
   constructor(private readonly mailingService: MailingService) {}

   @Post('register/')
   @AllowUnauthorized()
   public async registerEmail(@Body() registrationEmailDto: RegistrationMailRequestDto): Promise<void> {
      await this.mailingService.registrationEmail(registrationEmailDto);
   }
}
