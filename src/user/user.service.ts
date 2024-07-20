import { Organisation } from 'src/entities/organisation.entity';
import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Organisation) private readonly orgRepo: Repository<Organisation>
  ) {}

  async getUser(id: number, userDetails: { userId: number }): Promise<User> {
    try {
      const user = await this.userRepo.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      delete user.password;
      if (userDetails.userId === user.id) {
        return user;
      }

      const userOrganizations = user.organisations.some(org => org.users.some(user => user.id === userDetails.userId));

      if (!userOrganizations) {
        throw new ForbiddenException('No similar organisation found');
      }
      return user;
    } catch (error) {
      console.error('Error fetching user:', error);
      // Handle specific exceptions if needed
      if (error instanceof NotFoundException) {
        throw error;
      }
      // Handle unexpected errors
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  async findOne(email: string): Promise<User | undefined> {
    return this.userRepo.findOne({ where: { email } });
  }
}
