import { ObjectType, Field } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from 'user/entities/user.entity';

@ObjectType()
@Entity()
export class Post {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  text: string;

  @ManyToOne(() => User, (user) => user.posts)
  @Field(() => User)
  user: User;

  @Field()
  @Column()
  userId: string;

  @Field(() => Date, { defaultValue: Date.now() })
  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
