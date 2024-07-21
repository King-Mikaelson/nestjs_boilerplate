import { User } from '../../entities/user.entity';
import { Repository } from 'typeorm';
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/createUserDto';
import { UserService } from 'src/modules/user/user.service';
import { Organisation } from 'src/entities/organisation.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Organisation) private readonly orgRepo: Repository<Organisation>,
    private readonly userService: UserService
  ) {}

  async HandleCreateUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      const getExistingUser = await this.userRepo.findOne({ where: { email: createUserDto.email } });

      if (getExistingUser) {
        throw new BadRequestException('User already exists');
      }

      const user = await this.userRepo.create(createUserDto);
      // Create a default organisation for the user
      const defaultOrganisation = this.orgRepo.create({
        org_name: `${user.first_name}'s Organisation`,
        description: `Default organisation for ${user.first_name}`,
      });
      await this.orgRepo.save(defaultOrganisation);

      // Associate the user with the default organisation
      user.organisations = [defaultOrganisation];
      await this.userRepo.save(user);
      return await this.userRepo.save(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      // Handle specific exceptions if needed
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }
      // Handle unexpected errors
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  async validateUser(payload: any): Promise<any> {
    return this.userService.findOne(payload.username);
  }
}
