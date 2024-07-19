import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from '../user/user.service';

@Controller('api/v1/user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.userService.getUser(id);
  }
}
