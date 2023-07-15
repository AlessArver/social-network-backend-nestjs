import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateFriendInput {
  @Field()
  from_id: string;

  @Field()
  to_id: string;

  @Field()
  status: string;
}
