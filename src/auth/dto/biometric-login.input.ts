import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class BiometricLoginInput {
  @Field()
  @IsNotEmpty()
  biometricKey: string;
}