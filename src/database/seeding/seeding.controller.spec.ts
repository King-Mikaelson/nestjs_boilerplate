import { Test, TestingModule } from '@nestjs/testing';
import { SeedingController } from './seeding.controller';
import { SeedingService } from './seeding.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import dataSource from '../data-source';
import { SeedingModule } from './seeding.module';

describe('SeedingController', () => {
  let controller: SeedingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeedingController],
      providers: [SeedingService],
      imports: [
        TypeOrmModule.forRootAsync({
          useFactory: async () => ({
            ...dataSource.options,
          }),
          dataSourceFactory: async () => dataSource,
        }),
        SeedingModule,
      ],
    }).compile();

    controller = module.get<SeedingController>(SeedingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
