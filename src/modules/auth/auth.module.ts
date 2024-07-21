import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from 'src/modules/user/user.service';
import { Organisation } from 'src/entities/organisation.entity';
import { JwtService } from './jwt/jwt.service';
import * as dotenv from 'dotenv';
import { AuthGuard } from 'src/authGuard/jwt-auth.guard';
import { RoleGuard } from 'src/authGuard/role.guard';

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
  providers: [AuthService, UserService, JwtService, AuthGuard, RoleGuard],
  exports: [AuthGuard, JwtModule, RoleGuard],
})
export class AuthModule {}
