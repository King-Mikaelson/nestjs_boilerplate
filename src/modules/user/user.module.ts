import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Organisation } from 'src/entities/organisation.entity';
import { OrganisationService } from 'src/modules/organisation/organisation.service';
import { OrganisationModule } from 'src/modules/organisation/organisation.module';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '../auth/jwt/jwt.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Organisation]), OrganisationModule, AuthModule],
  controllers: [UserController],
  providers: [UserService, OrganisationService, AuthService, JwtService],
})
export class UserModule {}
