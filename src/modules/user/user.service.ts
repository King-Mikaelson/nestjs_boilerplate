import { Organisation } from '../../entities/organisation.entity';
import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Organisation) private readonly orgRepo: Repository<Organisation>
  ) {}

  async getUser(id: string, userDetails: { id: string }): Promise<User> {
    try {
      // const user = await this.userRepo.findOne({
      //   where: { id },
      // });

      // Retrieve the requested user along with their organisations
      const user = await this.userRepo.findOne({
        where: { id },
        relations: ['organisations'],
      });

      if (!user) {
        throw new NotFoundException(`User not found`);
      }
      delete user.password;
      if (userDetails.id === user.id) {
        delete user.organisations;
        return user;
      }

      // Retrieve the authenticated user along with their organisations
      const authenticatedUser = await this.userRepo.findOne({
        where: { id: userDetails.id },
        relations: ['organisations'],
      });

      // Get the IDs of organisations for both users
      const userOrgIds = user.organisations.map(org => org.org_id);
      const authenticatedUserOrgIds = authenticatedUser.organisations.map(org => org.org_id);

      // Check for common organisations
      const commonOrgIds = userOrgIds.filter(orgId => authenticatedUserOrgIds.includes(orgId));

      if (commonOrgIds.length === 0) {
        throw new ForbiddenException('No similar organisation found');
      }

      delete user.organisations;
      return user;
    } catch (error) {
      console.error('Error fetching user:', error);
      // Handle specific exceptions if needed
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof ForbiddenException) {
        throw error;
      }
      // Handle unexpected errors
      throw new InternalServerErrorException(error.message);
    }
  }

  async findOne(email: string): Promise<User | undefined> {
    return this.userRepo.findOne({ where: { email } });
  }
}
