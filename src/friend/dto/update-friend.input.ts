import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateFriendInput {
  @Field()
  id: string;

  @Field({ nullable: true })
  avatar: string;

  @Field()
  status: string;

  @Field({ nullable: true })
  first_name: string;

  @Field({ nullable: true })
  last_name: string;
}
