// import { TypeOrmModule } from '@nestjs/typeorm';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { User } from './entities/user.entity';
import { PostModule } from 'post/post.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), PostModule],
  providers: [UserResolver, UserService],
})
export class UserModule {}
