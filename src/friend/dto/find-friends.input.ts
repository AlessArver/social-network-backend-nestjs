import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class FriendsInput {
  @Field({ nullable: true })
  from_id: string;

  @Field({ nullable: true })
  to_id: string;

  @Field({ nullable: true })
  status: string;

  @Field({ nullable: true })
  limit: number;
}
