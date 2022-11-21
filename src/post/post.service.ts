import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { Post } from './entities/post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
  ) {}

  async create(data: CreatePostInput): Promise<Post> {
    const newPost = this.postRepository.create(data);
    return this.postRepository.save(newPost);
  }

  async findAll({ userId }: { userId?: string }) {
    return this.postRepository.find({ where: { userId } });
  }

  findOne(id: number) {
    return `This action returns a #${id} post`;
  }

  update(id: number, updatePostInput: UpdatePostInput) {
    return `This action updates a #${id} post`;
  }

  async remove(id: string): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id } });

    if (!post) {
      throw new HttpException(
        `Pos with this id: ${id} is not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const deletedPost = await this.postRepository.delete(id);

    if (deletedPost.affected === 1) {
      return post;
    }
  }
}
