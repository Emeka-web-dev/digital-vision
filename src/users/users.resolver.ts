import { Query, Resolver } from "@nestjs/graphql";
import { User } from "./models/user.model";
import { GqlAuthGuard } from "src/auth/gql-auth.guard";
import { UseGuards } from "@nestjs/common";
import { UserEntity } from "src/common/decorators/current-user.decorator";



Resolver(() => User)
@UseGuards(GqlAuthGuard)
export class UsersResolver {
  @Query(() => User)
  async me(@UserEntity() user: User): Promise<User> {    
    return user;
  }
}
