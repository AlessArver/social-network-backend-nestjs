import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { FriendService } from './friend.service';
import { Friend } from './entities/friend.entity';
import { CreateFriendInput } from './dto/create-friend.input';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { validateToken } from 'utils/validateToken';
import { FriendsInput } from './dto/find-friends.input';
import { UpdateFriendInput } from './dto/update-friend.input';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Resolver(() => Friend)
export class FriendResolver {
  @WebSocketServer()
  server: Server;

  constructor(private readonly friendService: FriendService) {}

  @SubscribeMessage('createFriend')
  async createFriend(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: CreateFriendInput,
  ) {
    const user = await validateToken(client.handshake.auth.token);
    if (user) {
      const newFriend = await this.friendService.create(data);
      this.server.emit('createFriend', newFriend);
      return newFriend;
    }
  }

  @Query(() => [Friend])
  friends(@Args('friendsInput') friendsInput: FriendsInput) {
    return this.friendService.findAll({ ...friendsInput });
  }

  @SubscribeMessage('updateFriend')
  async updateFriend(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: UpdateFriendInput,
  ) {
    const user = await validateToken(client.handshake.auth.token);
    if (user) {
      const newFriend = await this.friendService.update(data);
      this.server.emit('updateFriend', newFriend);
      return newFriend;
    }
  }

  @SubscribeMessage('removeFriend')
  async removeFriend(
    @ConnectedSocket() client: Socket,
    @MessageBody() id: string,
  ) {
    console.log('id', id);
    const user = await validateToken(client.handshake.auth.token);
    if (user) {
      const removedFriend = await this.friendService.remove(id);
      this.server.emit('removeFriend', removedFriend);
      return removedFriend;
    }
  }
}
