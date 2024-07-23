import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Organisation } from '../../entities/organisation.entity';
import { UserService } from '../user/user.service';
import { JwtService } from './jwt/jwt.service';
import { AuthGuard } from '../../authGuard/jwt-auth.guard';
import { RoleGuard } from '../../authGuard/role.guard';
import dataSource from '../../database/data-source';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({
          useFactory: async () => ({
            ...dataSource.options,
          }),
          dataSourceFactory: async () => dataSource,
        }),
        PassportModule,
        JwtModule.register({
          secret: process.env.JWT_SECRET, // Use environment variables for security
          signOptions: { expiresIn: '60m' }, // Token expiration time
        }),
        TypeOrmModule.forFeature([User, Organisation]),
      ],
      controllers: [AuthController],
      providers: [AuthService, UserService, JwtService, AuthGuard, RoleGuard],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });
});
