import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateFriendInput {
  @Field()
  from_id: string;

  @Field()
  to_id: string;

  @Field({ nullable: true })
  avatar: string;

  @Field()
  status: string;

  @Field()
  first_name: string;

  @Field()
  last_name: string;
}
