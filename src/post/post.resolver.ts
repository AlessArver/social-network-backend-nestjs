import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Resolver, Query, Args } from '@nestjs/graphql';

import { PostService } from './post.service';

import { CreatePostInput } from './dto/create-post.input';

import { Post } from './entities/post.entity';

import { validateToken } from 'utils/validateToken';

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

  @SubscribeMessage('createPost')
  async createPost(
    @ConnectedSocket() client: Socket,
    @MessageBody() createPostInput: CreatePostInput,
  ) {
    const user = await validateToken(client.handshake.auth.token);
    if (user) {
      const newPost = await this.postService.create(createPostInput);
      this.server.emit('createPost', newPost);
      return newPost;
    }
  }

  @SubscribeMessage('removePost')
  async removePost(
    @ConnectedSocket() client: Socket,
    @MessageBody() id: string,
  ) {
    const user = await validateToken(client.handshake.auth.token);
    if (user) {
      const deletedPost = await this.postService.remove(id);
      this.server.emit('removePost', deletedPost);
      return deletedPost;
    }
  }
}
