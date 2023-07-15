import { ObjectType, Field } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

  @Field(() => Boolean, { defaultValue: false })
  @Column({ default: false })
  is_online: boolean;

  @Field(() => String)
  @Column({ unique: true, nullable: true })
  socket_id: string;
}
