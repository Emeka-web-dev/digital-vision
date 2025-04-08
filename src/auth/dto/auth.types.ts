import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';



@ObjectType()
export class AuthResponse {
    @Field()
    token: string;

    @Field(() => User)
    user: User;
}

@ObjectType()
export class RegisterResponse {
    @Field(() => User)
    user: User;
}