import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import {
  ConnectedSocket,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

import { AuthGuard } from 'guards/auth.gaurd';

import { UserService } from './user.service';

import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { LoginUserInput } from './dto/login-user.input';

import { User } from './entities/user.entity';

enum USER_EVENTS {
  userUpdated = 'userUpdated',
}
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Resolver(() => User)
export class UserResolver {
  @WebSocketServer()
  server: Server;

  constructor(private readonly userService: UserService) {}

  @Mutation(() => User)
  createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.userService.create(createUserInput);
  }

  @Mutation(() => String)
  login(@Args('loginUserInput') loginUserInput: LoginUserInput) {
    return this.userService.login(loginUserInput);
  }

  @Mutation(() => String)
  resetPassword(@Args('email') email: string) {
    return this.userService.resetPassword(email);
  }

  @Query(() => [User])
  users() {
    return this.userService.findAll();
  }

  @Query(() => [User])
  usersByIds(@Args({ name: 'ids', type: () => [String!]! }) ids: string[]) {
    return this.userService.findAllByIds(ids);
  }

  @Query(() => User)
  async user(@Args('id') id: string) {
    const user = await this.userService.findOne(id);

    this.server.emit(`user-${user.id}`, user);

    return user;
  }

  @Query(() => User)
  @UseGuards(new AuthGuard())
  me(@Context('user') user: { id: string }) {
    return this.userService.findOne(user.id);
  }

  @Mutation(() => User)
  @UseGuards(new AuthGuard())
  async updateUser(
    @Context('user') user: { id: string },
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ) {
    const newUser = await this.userService.update({
      meId: user.id,
      updateUserInput,
    });

    this.server.emit(`user-${user.id}`, newUser);

    return newUser;
  }

  @Mutation(() => User)
  @UseGuards(new AuthGuard())
  removeUser(@Context('user') user: { id: string }, @Args('id') id: string) {
    if (user.id === id) {
      return this.userService.remove({ meId: user.id, id });
    }
  }
}
