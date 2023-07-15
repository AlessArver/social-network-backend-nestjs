import { Resolver, Query, Args, Mutation, Context } from '@nestjs/graphql';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

import { PostService } from './post.service';

import { CreatePostInput } from './dto/create-post.input';

import { Post } from './entities/post.entity';

import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'guards/auth.gaurd';

enum POST_EVENTS {
  postAdded = 'postAdded',
  postUpdated = 'postUpdated',
  postRemoved = 'postRemoved',
}
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Resolver(() => Post)
export class PostResolver {
  @WebSocketServer()
  server: Server;

  constructor(private readonly postService: PostService) {}

  @Query(() => [Post])
  posts(@Args('userId') userId: string) {
    return this.postService.findAll({ userId });
  }

  @Mutation(() => Post)
  @UseGuards(new AuthGuard())
  async createPost(
    @Context('user') user: { id: string },
    @Args('createPostInput') createPostInput: CreatePostInput,
  ) {
    const newPost = await this.postService.create({
      user,
      createPostInput,
    });
    this.server.emit(POST_EVENTS.postAdded, newPost);

    return newPost;
  }

  @Mutation(() => Post)
  @UseGuards(new AuthGuard())
  async removePost(
    @Context('user') user: { id: string },
    @Args('id') id: string,
  ) {
    const deletedPost = await this.postService.remove(id);
    this.server.emit(POST_EVENTS.postRemoved, deletedPost);

    return deletedPost;
  }
}
