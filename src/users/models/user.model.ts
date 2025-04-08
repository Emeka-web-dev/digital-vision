import { Field, ID, ObjectType } from '@nestjs/graphql';


@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field(() => String, { nullable: true })
  biometricKey?: string | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}