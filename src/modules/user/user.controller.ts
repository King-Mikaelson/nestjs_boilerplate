import { Controller, Get, HttpStatus, Param, ParseIntPipe, ParseUUIDPipe, Req, Res, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../../entities/user.entity';
import { Request, Response } from 'express';
import { RoleGuard } from '../../authGuard/role.guard';
import { Roles } from '../../helpers/role.decorator';

type PartialUser = Pick<User, 'email' | 'id'>;

interface RequestWithUser extends Request {
  user: PartialUser;
}

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @UseGuards(RoleGuard)
  @Roles() // Authorization based on roles
  @Get(':id')
  async findOne(@Req() request: RequestWithUser, @Res() response: Response, @Param('id', ParseUUIDPipe) id: string) {
    try {
      const userDetails = request.user;
      const user = await this.userService.getUser(id, userDetails);
      return response.status(HttpStatus.OK).send({
        status_code: HttpStatus.OK,
        message: 'User fetched successfully',
        user,
      });
    } catch (error) {
      return response.status(error.response.statusCode).send({
        message: error.response.message,
        status_code: error.response.statusCode,
        error: error.response.error,
      });
    }
  }
}
