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

  async create({
    user,
    createPostInput,
  }: {
    user: { id: string };
    createPostInput: CreatePostInput;
  }): Promise<Post> {
    if (user.id === createPostInput.userId) {
      const newPost = this.postRepository.create(createPostInput);

      return this.postRepository.save(newPost);
    } else {
      throw new HttpException(
        `You cannot create a post as another user`,
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async findAll({ userId }: { userId?: string }) {
    const posts = await this.postRepository.find({ where: { userId } });

    if (posts) {
      return posts;
    }

    return [];
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
