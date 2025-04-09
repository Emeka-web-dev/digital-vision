import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class BiometricLoginInput {  
  @Field()
  @IsNotEmpty()  
  biometricKey: string;
}
