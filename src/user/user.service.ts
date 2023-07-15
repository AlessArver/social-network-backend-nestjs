import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';

import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { comparePasswords, encodePassword } from 'utils/bcrypt';
import { LoginUserInput } from './dto/login-user.input';
import { isMe } from 'utils/isMe';
import { MailService } from 'mail/mail.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private mailService: MailService,
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

  async resetPassword(email: string) {
    const user = await this.userRepository.findOne({
      where: {
        email: email,
      },
    });

    if (!user) {
      throw new HttpException(
        'User with this email is not exist',
        HttpStatus.NOT_FOUND,
      );
    }

    const token = await this.createToken({
      id: user.id,
    });
    this.mailService.resetPassword(email, token);
    return 'true';
  }

  createToken(user: { id: string }) {
    return jwt.sign(user, 'secret-key');
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findAllByIds(ids: string[]): Promise<User[]> {
    return this.userRepository.findBy({ id: In(ids) });
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

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new HttpException(
        `User with this email: ${email} is not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return user;
  }

  async findBySocketId(socket_id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { socket_id } });

    // if (!user) {
    //   throw new HttpException(
    //     `User with this socket_id: ${socket_id} is not found`,
    //     HttpStatus.NOT_FOUND,
    //   );
    // }

    if (user) {
      return user;
    }
  }

  async update({
    meId,
    updateUserInput,
  }: {
    meId: string;
    updateUserInput: UpdateUserInput;
  }): Promise<User> {
    return isMe<Promise<User>>({
      meId,
      id: updateUserInput.id,
      textError: 'You cannot update another user',
      func: async () => {
        const user = await this.userRepository.findOne({
          where: { id: updateUserInput.id },
        });

        if (!user) {
          throw new HttpException(
            `User with this id: ${updateUserInput.id} is not found`,
            HttpStatus.NOT_FOUND,
          );
        }

        const newUser = this.userRepository.create({
          ...user,
          ...updateUserInput,
        });

        return this.userRepository.save(newUser);
      },
    });
  }

  async updateOnline({
    is_online,
    id,
    socket_id,
  }: {
    is_online: boolean;
    id: string;
    socket_id: string;
  }): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new HttpException(
        `User with this id: ${id} is not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const newUser = this.userRepository.create({
      ...user,
      is_online,
      socket_id,
    });
    return this.userRepository.save(newUser);
  }
  async remove({ meId, id }: { meId: string; id: string }): Promise<User> {
    return isMe<Promise<User>>({
      meId,
      id,
      textError: 'You cannot remove another user',
      func: async () => {
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
      },
    });
  }
}
