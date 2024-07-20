import { BadRequestException, Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/createUserDto';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private jwtService: JwtService
  ) {}

  @Post('api/v1/auth')
  async create(@Body() createUserDto: CreateUserDto, @Res() response: Response) {
    try {
      const user = await this.authService.HandleCreateUser(createUserDto);

      const accessToken = this.jwtService.sign({
        email: user.email,
        id: user.id,
      });

      const responsePayload = {
        token: accessToken,
        user: {
          id: user.id,
          first_name: user.name,
          email: user.email,
        },
      };

      return response.status(HttpStatus.CREATED).send({
        status_code: HttpStatus.CREATED,
        message: 'User created Successfully',
        data: responsePayload,
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
