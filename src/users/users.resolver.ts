import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { GqlAuthGuard } from "src/auth/gql-auth.guard";
import { UserEntity } from "src/common/decorators/current-user.decorator";
import { User } from "./models/user.model";
import { UsersService } from "./users.service";



Resolver(() => User)
@UseGuards(GqlAuthGuard)
export class UsersResolver {
    constructor(private readonly usersService: UsersService) {}
  @Query(() => User)
  async me(@UserEntity() user: User): Promise<User> {    
    return user;
  }

  @Mutation(() => User)
    async setBiometricData(
        @UserEntity() user: User,
        @Args("data") data: string
    ): Promise<User> {        
        return await this.usersService.setBiometricKey(user.id, data);
    }
}
