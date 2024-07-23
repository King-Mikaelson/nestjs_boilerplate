import { Module } from '@nestjs/common';
import { OrganisationController } from './organisation.controller';
import { OrganisationService } from './organisation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organisation } from '../../entities/organisation.entity';

@Module({
  controllers: [OrganisationController],
  providers: [OrganisationService],
  imports: [TypeOrmModule.forFeature([Organisation])],
})
export class OrganisationModule {}
