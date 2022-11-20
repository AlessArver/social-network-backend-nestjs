import { HttpException, HttpStatus } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

export const validateToken = (auth: string) => {
  if (auth.split(' ')[0] !== 'Bearer') {
    throw new HttpException('User is not found', HttpStatus.UNAUTHORIZED);
  }
  const token = auth.split(' ')[1];

  try {
    return jwt.verify(token, 'secret-key');
  } catch (e) {
    throw new HttpException('User is not found', HttpStatus.UNAUTHORIZED);
  }
};
