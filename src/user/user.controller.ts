import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from 'src/entities/user.entity';

@Controller('api/v1/user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    // Use try-catch for error handling
    try {
      // Call the service method to get the user
      return await this.userService.getUser(id);
    } catch (error) {
      // Log the error and rethrow it
      console.error('Error fetching user:', error);
      throw error; // Re-throwing to be handled by global error handler or NestJS
    }
  }
}
