import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';

import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { comparePasswords, encodePassword } from 'utils/bcrypt';
import { LoginUserInput } from './dto/login-user.input';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async create(data: CreateUserInput) {
    const user = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (user) {
      throw new HttpException(
        'User with this email already exist',
        HttpStatus.CONFLICT,
      );
    }
    const password = await encodePassword(data.password);
    const newUser = this.userRepository.create({
      ...data,
      password,
    });

    const createdUser = await this.userRepository.save(newUser);

    return createdUser;
  }

  async login(data: LoginUserInput): Promise<string> {
    const user = await this.userRepository.findOne({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      throw new HttpException(
        'User with this email is not exist',
        HttpStatus.NOT_FOUND,
      );
    }

    const isMatch = await comparePasswords(data.password, user.password);

    if (isMatch) {
      return this.createToken({
        id: user.id,
      });
    } else {
      throw new HttpException('Passwords is not compare', HttpStatus.NOT_FOUND);
    }
  }

  createToken(user: { id: string }) {
    return jwt.sign(user, 'secret-key');
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new HttpException(
        `User with this id: ${id} is not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return user;
  }

  async update(data: UpdateUserInput): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: data.id } });

    if (!user) {
      throw new HttpException(
        `User with this id: ${data.id} is not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const newUser = this.userRepository.create(data);

    return this.userRepository.save(newUser);
  }

  async remove(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new HttpException(
        `User with this id: ${id} is not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const deletedUser = await this.userRepository.delete(id);

    if (deletedUser.affected === 1) {
      return user;
    }
  }
}
