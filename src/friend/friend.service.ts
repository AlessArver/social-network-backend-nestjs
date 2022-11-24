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

  findAll({
    from_id,
    to_id,
  }: {
    from_id?: string;
    to_id?: string;
  }): Promise<Friend[]> {
    if (from_id && to_id) {
      return this.friendRepository.find({ where: { from_id, to_id } });
    } else if (from_id && !to_id) {
      return this.friendRepository.find({ where: { from_id } });
    } else if (!from_id && to_id) {
      return this.friendRepository.find({ where: { to_id } });
    }
    return this.friendRepository.find();
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

    const newFriend = this.friendRepository.create(data);

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

    const deletedFriend = await this.friendRepository.delete(id);

    if (deletedFriend.affected === 1) {
      return friend;
    }
  }
}
