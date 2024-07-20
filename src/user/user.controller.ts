import { Controller, Get, HttpStatus, Param, ParseIntPipe, Req, Res } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from 'src/entities/user.entity';
import { Request, Response } from 'express';

@Controller('api/v1/user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get(':id')
  async findOne(@Req() request: Request, @Res() response: Response, @Param('id', ParseIntPipe) id: number) {
    try {
      // Call the service method to get the user
      // const userDetails = request.user;
      const userDetails = { userId: 1 };
      const user = await this.userService.getUser(id, userDetails);
      return response.status(HttpStatus.CREATED).send({
        status_code: HttpStatus.OK,
        message: 'User fetched successfully',
        user,
      });
    } catch (error) {
      console.log('UserControllerError ~ Error ~', error);
      return response.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: error.message || 'Internal server error',
        status_code: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        error: error.name || 'Error',
      });
    }
  }
}
