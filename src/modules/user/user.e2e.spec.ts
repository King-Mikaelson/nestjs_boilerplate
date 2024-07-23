import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { User } from '../../entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Organisation } from '../../entities/organisation.entity';
import { AuthModule } from '../auth/auth.module';
import { OrganisationModule } from '../organisation/organisation.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import * as dotenv from 'dotenv';

describe('UserController (Integration)', () => {
  let app: INestApplication;
  let userRepo: Repository<User>;
  let orgRepo: Repository<Organisation>;
  let jwtService: JwtService;

  beforeAll(async () => {
    dotenv.config();

    const dataSource = new DataSource({
      type: process.env.DB_TYPE as 'postgres',
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      entities: [process.env.DB_ENTITIES],
      migrations: [process.env.DB_MIGRATIONS],
      synchronize: true,
      migrationsTableName: 'migrations',
      ssl: {
        rejectUnauthorized: false,
      },
      logging: true,
    });

    await dataSource.initialize();

    jest.setTimeout(50000); // Increase timeout to 30 seconds
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, OrganisationModule, AuthModule],
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Organisation),
          useClass: Repository,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    userRepo = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    orgRepo = moduleFixture.get<Repository<Organisation>>(getRepositoryToken(Organisation));
    jwtService = moduleFixture.get<JwtService>(JwtService);
  }, 50000);

  beforeEach(async () => {
    await userRepo.clear();
  });

  afterAll(async () => {
    if (app) {
      await app.close(); // Ensure app is defined before closing
    }
  }, 10000);

  describe('/user/:id (GET)', () => {
    it('should return user details if found and in the same organisation', async () => {
      const user = await userRepo.save({
        id: 'user-id',
        email: 'user@example.com',
        organisations: [{ org_id: 'org-1' }],
      });

      const authenticatedUser = await userRepo.save({
        id: 'authenticated-user-id',
        email: 'auth-user@example.com',
        organisations: [{ org_id: 'org-1' }],
      });

      const token = jwtService.sign({ id: authenticatedUser.id });

      const response = await request(app.getHttpServer())
        .get(`/user/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toEqual({
        status_code: 200,
        message: 'User fetched successfully',
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          is_active: user.is_active,
          attempts_left: user.attempts_left,
          time_left: user.time_left,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
      });
    }, 50000);

    it('should return 404 if user is not found', async () => {
      const authenticatedUser = await userRepo.save({
        id: 'authenticated-user-id',
        email: 'auth-user@example.com',
        organisations: [{ org_id: 'org-1' }],
      });

      const token = jwtService.sign({ id: authenticatedUser.id });

      const response = await request(app.getHttpServer())
        .get('/user/non-existing-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body).toEqual({
        status_code: 404,
        message: 'User not found',
      });
    }, 50000);

    it('should return 403 if no common organisations are found', async () => {
      const user = await userRepo.save({
        id: 'user-id',
        email: 'user@example.com',
        organisations: [{ org_id: 'org-2' }],
      });

      const authenticatedUser = await userRepo.save({
        id: 'authenticated-user-id',
        email: 'auth-user@example.com',
        organisations: [{ org_id: 'org-1' }],
      });

      const token = jwtService.sign({ id: authenticatedUser.id });

      const response = await request(app.getHttpServer())
        .get(`/user/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body).toEqual({
        status_code: 403,
        message: 'Forbidden: No common organisation',
      });
    }, 50000);
  });
});
