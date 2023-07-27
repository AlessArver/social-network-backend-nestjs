import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TokensUserInput {
  @Field()
  accessToken!: string;

  @Field()
  refreshToken!: string;
}
