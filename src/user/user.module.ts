import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { ProfileService } from 'src/profile/profile.service';
import { ProductsService } from 'src/products/products.service';
import { Organisation } from 'src/entities/organisation.entity';
import { OrganisationService } from 'src/organisation/organisation.service';
import { OrganisationModule } from 'src/organisation/organisation.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Organisation]), OrganisationModule],
  controllers: [UserController],
  providers: [UserService, OrganisationService, ProfileService, ProductsService],
})
export class UserModule {}
