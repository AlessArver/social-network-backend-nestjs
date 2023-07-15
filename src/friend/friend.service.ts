import { FriendsInput } from './dto/find-friends.input';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFriendInput } from './dto/create-friend.input';
import { UpdateFriendInput } from './dto/update-friend.input';
import { Friend } from './entities/friend.entity';

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(Friend) private friendRepository: Repository<Friend>,
  ) {}

  create(data: CreateFriendInput): Promise<Friend> {
    const newFriend = this.friendRepository.create(data);
    return this.friendRepository.save(newFriend);
  }

  async findAll({
    from_id,
    to_id,
    limit,
    status,
  }: FriendsInput): Promise<Friend[]> {
    const properties = {
      from_id: from_id ? from_id : undefined,
      to_id: to_id ? to_id : undefined,
      status: status ? status : undefined,
    };

    const friends = await this.friendRepository.find({
      where: { ...properties },
      take: limit,
    });

    return friends;
  }

  async find({ from_id, to_id }: FriendsInput): Promise<Friend> {
    const properties = {
      from_id: from_id ? from_id : undefined,
      to_id: to_id ? to_id : undefined,
    };

    const friend = await this.friendRepository.findOne({
      where: { ...properties },
    });

    return friend;
  }

  async update(data: UpdateFriendInput): Promise<Friend> {
    const friend = await this.friendRepository.findOne({
      where: { id: data.id },
    });

    if (!friend) {
      throw new HttpException(
        `Friend with this id: ${data.id} is not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const newFriend = this.friendRepository.create({ ...friend, ...data });

    return this.friendRepository.save(newFriend);
  }

  async remove(id: string): Promise<Friend> {
    const friend = await this.friendRepository.findOne({ where: { id } });

    if (!friend) {
      throw new HttpException(
        `Friend with this id: ${id} is not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.friendRepository.delete(id);

    return friend;
  }

  async removeAll() {
    await this.friendRepository.clear();
  }
}
