import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { join } from 'path';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async resetPassword(email: string, token: string) {
    await this.mailerService
      .sendMail({
        to: email,
        from: process.env.MAIL_FROM,
        subject: 'Reset password',
        template: join(__dirname, 'templates', 'resetPassword.hbs'),
        context: {
          url: `http://localhost:3000/reset-password/${token}`,
        },
      })
      .catch((e) => {
        throw new HttpException(
          `Some error with mail: ${JSON.stringify(e)}`,
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      });
  }
}
