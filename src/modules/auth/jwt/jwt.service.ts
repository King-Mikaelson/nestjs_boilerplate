// // src/auth/jwt.service.ts
// import { Injectable } from '@nestjs/common';
// import * as jwt from 'jsonwebtoken';
// import * as dotenv from 'dotenv';

// dotenv.config();
// @Injectable()
// export class JwtService {
//   private readonly secret = process.env.JWT_SECRET

//   sign(payload: any): string {
//     return jwt.sign(payload, this.secret, { expiresIn: '1h' });
//   }

//   verify(token: string): any {
//     try {
//       return jwt.verify(token, this.secret);
//     } catch (error) {
//       throw new Error('Invalid token');
//     }
//   }
// }

import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class JwtService extends NestJwtService {
  readonly secret: string;

  constructor() {
    super({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    });
    this.secret = process.env.JWT_SECRET;
  }

  sign(payload: any): string {
    return super.sign(payload);
  }

  verify(token: string): any {
    try {
      return super.verify(token);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}
