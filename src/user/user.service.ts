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
import { RecoverPasswordInput } from './dto/recover-password.input';

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
      const tokens = await this.getNewTokens(user.id);
      return tokens.accessToken;
    } else {
      throw new HttpException('Passwords is not compare', HttpStatus.NOT_FOUND);
    }
  }

  async getNewTokens(id: string) {
    const tokens = await this.getTokens(id);
    await this.updateRefreshToken(id, tokens.refreshToken);
    return tokens;
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await encodePassword(refreshToken);
    await this.update({ id: userId, refresh_token: hashedRefreshToken });
  }

  async getTokens(id: string) {
    const accessToken = jwt.sign(id, process.env.JWT_ACCESS_SECRET, {
      // expiresIn: 60 * 60,
    });
    const refreshToken = jwt.sign(id, process.env.JWT_REFRESH_SECRET, {
      // expiresIn: 60 * 60,
    });

    return {
      accessToken,
      refreshToken,
    };
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

    const token = this.createToken(
      { id: user.id },
      process.env.JWT_RESET_PASSWORD_SECRET,
      // { expiresIn: '1h' },
    );

    this.userRepository.save({ ...user, reset_password_token: token });
    this.mailService.resetPassword(email, token);

    return true;
  }

  async recoverPasswordAccess(token: string) {
    const verifyToken = jwt.verify(
      token,
      process.env.JWT_RESET_PASSWORD_SECRET,
    );
    const user = await this.userRepository.findOne({
      where: {
        reset_password_token: token,
      },
    });

    if (!verifyToken) {
      throw new HttpException(`Token is not valid`, HttpStatus.FORBIDDEN);
    }

    if (!user) return false;

    return true;
  }

  async recoverPassword(recoverPasswordInput: RecoverPasswordInput) {
    const user = await this.userRepository.findOne({
      where: { reset_password_token: recoverPasswordInput.token },
    });

    if (!user) {
      throw new HttpException(
        `User with this token: ${recoverPasswordInput.token} is not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const password = await encodePassword(recoverPasswordInput.password);

    this.userRepository.save({
      ...user,
      reset_password_token: null,
      password,
    });

    return true;
  }

  createToken(
    data: { [key: string]: any },
    secretKey: string,
    optinos?: jwt.SignOptions,
  ) {
    return jwt.sign(data, secretKey, optinos);
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

  async update(updateUserInput: UpdateUserInput): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: updateUserInput.id },
    });

    if (!user) {
      throw new HttpException(
        `User with this id: ${updateUserInput.id} is not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return this.userRepository.save({ ...user, ...updateUserInput });
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
