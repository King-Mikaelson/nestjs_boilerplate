import { Test, TestingModule } from '@nestjs/testing';
import { SeedingService } from './seeding.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import dataSource from '../data-source';
import { SeedingModule } from './seeding.module';

describe('SeedingService', () => {
  let service: SeedingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({
          useFactory: async () => ({
            ...dataSource.options,
          }),
          dataSourceFactory: async () => dataSource,
        }),
        SeedingModule,
      ],
      providers: [SeedingService],
    }).compile();

    service = module.get<SeedingService>(SeedingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
