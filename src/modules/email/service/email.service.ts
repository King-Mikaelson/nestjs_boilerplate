// src/email/email.service.ts
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendUserConfirmation(email: string, token: string, url: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to My App! Confirm your Email',
      template: 'confirmation', // .pug, .ejs, or .hbs
      context: {
        token,
        url,
        name: 'Recipient',
      },
    });
  }

  async sendForgotPassword(email: string, token: string, url: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset Password',
      template: 'reset-password',
      context: {
        token,
        url,
        name: 'Recipient',
      },
    });
  }
}
