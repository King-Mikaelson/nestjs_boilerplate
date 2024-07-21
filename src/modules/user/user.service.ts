import { Organisation } from 'src/entities/organisation.entity';
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
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      delete user.password;
      if (userDetails.id === user.id) {
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

      // Check if authenticated user shares any organizations with requested user
      const userOrganizations = await this.orgRepo
        .createQueryBuilder('organisation')
        .innerJoin('organisation.users', 'user', 'user.id = :userId', { userId: userDetails.id })
        .innerJoin('organisation.users', 'requestedUser', 'requestedUser.id = :requestedUserId', {
          requestedUserId: user.id,
        })
        .getMany();

      // Query the join table directly
      const commonOrganisations1 = await this.userRepo
        .createQueryBuilder('user')
        .innerJoin('user.organisations', 'organisation')
        .innerJoin('user_organisations', 'user_org', 'user_org.organisation_id = organisation.org_id')
        .where('user_org.user_id = :authenticatedUserId', { authenticatedUserId: authenticatedUser.id })
        .andWhere('user_org.organisation_id IN (:...organisationIds)', {
          organisationIds: user.organisations.map(org => org.org_id),
        })
        .getMany();

      const commonOrganisations2 = await this.userRepo
        .createQueryBuilder('user')
        .innerJoin('user.organisations', 'organisation')
        .innerJoin('user_organisations', 'user_org', 'user_org.organisation_id = organisation.org_id')
        .where('user_org.user_id = :authenticatedUserId', { authenticatedUserId: userDetails.id })
        .andWhere(
          'user_org.organisation_id IN (SELECT user_org_2.organisation_id FROM user_organisations user_org_2 WHERE user_org_2.user_id = :requestedUserId)',
          { requestedUserId: user.id }
        )
        .getMany();

      if (commonOrganisations2.length === 0) {
        throw new ForbiddenException('No similar organisation found');
      }

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
      throw new InternalServerErrorException(error.message);
    }
  }

  async findOne(email: string): Promise<User | undefined> {
    return this.userRepo.findOne({ where: { email } });
  }
}
