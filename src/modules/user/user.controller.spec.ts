import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '../auth/jwt/jwt.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Organisation } from '../../entities/organisation.entity';
import { OrganisationModule } from '../organisation/organisation.module';
import { AuthModule } from '../auth/auth.module';
import dataSource from '../../database/data-source';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      imports: [
        TypeOrmModule.forRootAsync({
          useFactory: async () => ({
            ...dataSource.options,
          }),
          dataSourceFactory: async () => dataSource,
        }),
        TypeOrmModule.forFeature([User, Organisation]),
        OrganisationModule,
        AuthModule,
      ],
      providers: [
        {
          provide: UserService,
          useValue: {
            getUser: jest.fn().mockImplementation((id, userDetails) => {
              if (id === 'user-id') {
                return Promise.resolve({ id: 'user-id', email: 'user@example.com' });
              }
              throw new NotFoundException(`User not found`);
            }),
          },
        },
        AuthService,
        JwtService,
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  }, 100000);

  it('should return user details on successful fetch', async () => {
    const userId = 'user-id';
    const userDetails = { id: 'authenticated-user-id', email: 'auth-user@example.com' };
    const request = { user: userDetails } as any;
    const response = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;

    const user = { id: userId, email: 'user@example.com' };
    jest.spyOn(service, 'getUser').mockResolvedValueOnce(user as any);

    await controller.findOne(request, response, userId);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.send).toHaveBeenCalledWith({
      status_code: 200,
      message: 'User fetched successfully',
      user,
    });
  }, 10000);

  it('should handle NotFoundException', async () => {
    const userId = '1234567';
    const userDetails = { id: 'authenticated-user-id', email: 'auth-user@example.com' };
    const request = { user: userDetails } as any;
    const response = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;

    jest.spyOn(service, 'getUser').mockRejectedValueOnce(new NotFoundException(`User not found`));

    await controller.findOne(request, response, userId);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.send).toHaveBeenCalledWith({
      message: 'User not found',
      status_code: 404,
      error: 'Not Found',
    });
  }, 10000);

  it('should handle ForbiddenException', async () => {
    const userId = 'some-user-id';
    const userDetails = { id: 'authenticated-user-id', email: 'auth-user@example.com' };
    const request = { user: userDetails } as any;
    const response = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;

    jest.spyOn(service, 'getUser').mockRejectedValueOnce(new ForbiddenException('No similar organisation found'));

    await controller.findOne(request, response, userId);
    console.log(response.status, response.send);
    expect(response.status).toHaveBeenCalledWith(403);
    expect(response.send).toHaveBeenCalledWith({
      message: 'No similar organisation found',
      status_code: 403,
      error: 'Forbidden',
    });
  }, 1000);
});
