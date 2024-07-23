import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { JwtService } from './jwt/jwt.service';
import { AuthGuard } from '../../authGuard/jwt-auth.guard';
import { RoleGuard } from '../../authGuard/role.guard';
import { User } from '../../entities/user.entity';
import { Organisation } from '../../entities/organisation.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import dataSource from '../../database/data-source';

describe('AuthController', () => {
  let controller: AuthController;

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

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
