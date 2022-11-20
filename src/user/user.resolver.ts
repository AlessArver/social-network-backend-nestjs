import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  MessageBody,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import {
  ResolveField,
  Resolver,
  Parent,
  Query,
  Mutation,
  Args,
  Context,
} from '@nestjs/graphql';
import { Server } from 'socket.io';

import { AuthGuard } from 'guards/auth.gaurd';

import { UserService } from './user.service';

import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { LoginUserInput } from './dto/login-user.input';

import { User } from './entities/user.entity';
import { PostService } from 'post/post.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Resolver(() => User)
export class UserResolver {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly userService: UserService,
    private postService: PostService,
  ) {}

  @Mutation(() => User)
  createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.userService.create(createUserInput);
  }

  @Mutation(() => String)
  login(@Args('loginUserInput') loginUserInput: LoginUserInput) {
    return this.userService.login(loginUserInput);
  }

  @Query(() => [User])
  users() {
    return this.userService.findAll();
  }

  @Query(() => User)
  user(@Args('id') id: string) {
    return this.userService.findOne(id);
  }

  @Query(() => User)
  @UseGuards(new AuthGuard())
  me(@Context('user') user: { id: string }) {
    return this.userService.findOne(user.id);
  }

  @Mutation(() => User)
  @UseGuards(new AuthGuard())
  updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput) {
    return this.userService.update(updateUserInput);
  }

  @Mutation(() => User)
  @UseGuards(new AuthGuard())
  removeUser(@Args('id') id: string) {
    return this.userService.remove(id);
  }
}
