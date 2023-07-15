import { ObjectType, Field } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class Post {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  text: string;

  @Field()
  @Column()
  userId: string;

  @Field(() => Date, { defaultValue: Date.now() })
  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
