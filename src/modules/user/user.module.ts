import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Organisation } from '../../entities/organisation.entity';
import { OrganisationService } from '../../modules/organisation/organisation.service';
import { OrganisationModule } from '../../modules/organisation/organisation.module';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '../auth/jwt/jwt.service';
import { AuthModule } from '../auth/auth.module';
import { EmailService } from '../email/service/email.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Organisation]), OrganisationModule, AuthModule],
  controllers: [UserController],
  providers: [UserService, OrganisationService, AuthService, JwtService, EmailService],
})
export class UserModule {}
