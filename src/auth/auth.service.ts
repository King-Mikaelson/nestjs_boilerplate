import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/createUserDto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly userService: UserService
  ) {}

  async HandleCreateUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      const getExistingUser = await this.userRepo.findOne({ where: { email: createUserDto.email } });

      if (getExistingUser) {
        throw new BadRequestException('User already exists');
      }

      const user = await this.userRepo.create(createUserDto);
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
