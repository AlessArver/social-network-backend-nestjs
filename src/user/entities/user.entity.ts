import { ObjectType, Field } from '@nestjs/graphql';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Post } from 'post/entities/post.entity';

@ObjectType()
@Entity()
export class User {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  first_name: string;

  @Field()
  @Column()
  last_name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  avatar: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Field()
  @Column()
  password: string;

  @OneToMany(() => Post, (post) => post.user)
  @Field(() => [Post], { nullable: true })
  posts: Post[];
}
