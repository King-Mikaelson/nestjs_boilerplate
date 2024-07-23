// src/email/email.module.ts
import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { EmailController } from './controller/email.controller';
import { EmailService } from './service/email.service';
import * as dotenv from 'dotenv';

dotenv.config();
console.log('Template directory:', join(__dirname, 'templates'));
console.log('Sending email with template:', 'confirmation');

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com', // Replace with your SMTP host
        port: 465,

        auth: {
          user: 'anazodomichael27@gmail.com', // Replace with your SMTP username
          pass: 'bcgbkiktdrvhceis', // Replace with your SMTP password
        },
      },
      defaults: {
        from: '"No Reply" <anazodomichael27@gmail.com>',
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(), // or new PugAdapter() or new EjsAdapter()
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
  controllers: [EmailController],
})
export class EmailModule {}
