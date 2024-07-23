import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Organisation } from '../../entities/organisation.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let userRepo: Repository<User>;
  let orgRepo: Repository<Organisation>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useClass: Repository },
        { provide: getRepositoryToken(Organisation), useClass: Repository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
    orgRepo = module.get<Repository<Organisation>>(getRepositoryToken(Organisation));
  });

  it('should return user details if user is found and in the same organisation', async () => {
    const userId = 'user-id';
    const userDetails = { id: 'authenticated-user-id' };

    const user = {
      id: userId,
      email: 'user@example.com',
      organisations: [{ org_id: 'org-1' }],
    } as User;

    const authenticatedUser = {
      id: userDetails.id,
      email: 'auth-user@example.com',
      organisations: [{ org_id: 'org-1' }],
    } as User;

    jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce(user);
    jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce(authenticatedUser);

    const result = await service.getUser(userId, userDetails);
    expect(result).toEqual({
      id: user.id,
      email: user.email,
    });
  }, 10000);

  it('should throw NotFoundException if user is not found', async () => {
    const userId = 'non-existing-id';
    const userDetails = { id: 'authenticated-user-id' };

    jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce(null);

    await expect(service.getUser(userId, userDetails)).rejects.toThrow(NotFoundException);
  }, 10000);

  it('should throw ForbiddenException if no common organisations are found', async () => {
    const userId = 'user-id';
    const userDetails = { id: 'authenticated-user-id' };

    const user = {
      id: userId,
      email: 'user@example.com',
      organisations: [{ org_id: 'org-2' }],
    } as User;

    const authenticatedUser = {
      id: userDetails.id,
      email: 'auth-user@example.com',
      organisations: [{ org_id: 'org-1' }],
    } as User;

    jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce(user);
    jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce(authenticatedUser);

    await expect(service.getUser(userId, userDetails)).rejects.toThrow(ForbiddenException);
  }, 10000);
});
