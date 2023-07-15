import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

import { AuthGuard } from 'guards/auth.gaurd';

import { FriendService } from './friend.service';

import { Friend } from './entities/friend.entity';

import { CreateFriendInput } from './dto/create-friend.input';
import { FriendsInput } from './dto/find-friends.input';
import { UpdateFriendInput } from './dto/update-friend.input';

enum FRIEND_EVENTS {
  friendAdded = 'friendAdded',
  friendUpdated = 'friendUpdated',
  friendRemoved = 'friendRemoved',
}
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

  @Mutation(() => Friend)
  @UseGuards(new AuthGuard())
  async createFriend(
    @Context('user') user: { id: string },
    @Args('createFriendInput') createFriendInput: CreateFriendInput,
  ) {
    const newFriend = await this.friendService.create(createFriendInput);

    this.server.emit(
      `friend-${newFriend.from_id}-${newFriend.to_id}`,
      newFriend,
    );

    return newFriend;
  }

  @Query(() => [Friend])
  async friends(@Args('friendsInput') friendsInput: FriendsInput) {
    const friends = await this.friendService.findAll({ ...friendsInput });
    return friends;
  }

  @Query(() => Friend)
  async friend(@Args('friendsInput') friendsInput: FriendsInput) {
    const friend = await this.friendService.find({ ...friendsInput });

    this.server.emit(`friend-${friend.from_id}-${friend.to_id}`, friend);

    return friend;
  }

  @Mutation(() => Friend)
  @UseGuards(new AuthGuard())
  async updateFriend(
    @Context('user') user: { id: string },
    @Args('updateFriendInput') updateFriendInput: UpdateFriendInput,
  ) {
    const newFriend = await this.friendService.update(updateFriendInput);

    this.server.emit(
      `friend-${newFriend.from_id}-${newFriend.to_id}`,
      newFriend,
    );

    return newFriend;
  }

  @Mutation(() => String)
  @UseGuards(new AuthGuard())
  async removeFriend(
    @Context('user') user: { id: string },
    @Args('id') id: string,
  ) {
    const removedFriend = await this.friendService.remove(id);

    this.server.emit(FRIEND_EVENTS.friendRemoved, removedFriend.id);

    return removedFriend.id;
  }

  @Mutation(() => String)
  async removeFriends() {
    await this.friendService.removeAll();

    return 'friends removed';
  }
}
