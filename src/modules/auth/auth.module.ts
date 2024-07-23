import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from '../../modules/user/user.service';
import { Organisation } from '../../entities/organisation.entity';
import { JwtService } from './jwt/jwt.service';
import * as dotenv from 'dotenv';
import { AuthGuard } from '../../authGuard/jwt-auth.guard';
import { RoleGuard } from '../../authGuard/role.guard';
import { EmailService } from '../email/service/email.service';

dotenv.config();

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET, // Use environment variables for security
      signOptions: { expiresIn: '60m' }, // Token expiration time
    }),
    TypeOrmModule.forFeature([User, Organisation]),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, JwtService, AuthGuard, RoleGuard, EmailService],
  exports: [AuthGuard, JwtModule, RoleGuard],
})
export class AuthModule {}
