import { Controller, Get, HttpStatus, Param, ParseIntPipe, ParseUUIDPipe, Req, Res, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from 'src/entities/user.entity';
import { Request, Response } from 'express';
import { RoleGuard } from 'src/authGuard/role.guard';
import { Roles } from 'src/helpers/role.decorator';

type PartialUser = Pick<User, 'email' | 'id'>;

interface RequestWithUser extends Request {
  user: PartialUser;
}

@Controller('api/v1/user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @UseGuards(RoleGuard)
  @Roles() // Authorization based on roles
  @Get(':id')
  async findOne(@Req() request: RequestWithUser, @Res() response: Response, @Param('id', ParseUUIDPipe) id: string) {
    try {
      // Call the service method to get the user
      // const userDetails = request.user;
      const userDetails = request.user;
      const user = await this.userService.getUser(id, userDetails);
      return response.status(HttpStatus.CREATED).send({
        status_code: HttpStatus.OK,
        message: 'User fetched successfully',
        user,
      });
    } catch (error) {
      return response.status(error.response.statusCode).send({
        message: error.response.message,
        status_code: error.response.code,
        error: error.response.error,
      });
    }
  }
}
