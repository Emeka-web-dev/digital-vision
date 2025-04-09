import {
    Resolver,
    Mutation,
    Args,
    Parent,
    ResolveField,
  } from '@nestjs/graphql';
  import { AuthService } from './auth.service';
  import { Auth } from './models/auth.model';
  import { Token } from './models/token.model';
  import { LoginInput } from './dto/login.input';
  import { SignupInput } from './dto/signup.input';
  import { RefreshTokenInput } from './dto/refresh-token.input';
  import { User } from '../users/models/user.model';
import { GqlAuthGuard } from './gql-auth.guard';
import { UseGuards } from '@nestjs/common';
import { UserEntity } from 'src/common/decorators/current-user.decorator';
import { UsersService } from 'src/users/users.service';
import { BiometricLoginInput } from './dto/biometric-login.input';

  @Resolver(() => Auth)
  export class AuthResolver {
    constructor(private readonly auth: AuthService, private readonly usersService: UsersService) {}
  
    @Mutation(() => Auth)
    async signup(@Args('data') data: SignupInput) {
      data.email = data.email.toLowerCase();
      const { accessToken, refreshToken } = await this.auth.createUser(data);
      return {
        accessToken,
        refreshToken,
      };
    }
  
    @Mutation(() => Auth)
    async login(@Args('data') { email, password }: LoginInput) {
      const { accessToken, refreshToken } = await this.auth.login(
        email.toLowerCase(),
        password,
      );
  
      return {
        accessToken,
        refreshToken,
      };
    }
  
    @Mutation(() => Token)
    async refreshToken(@Args() { token }: RefreshTokenInput) {
      return this.auth.getRefreshToken(token);
    }

    @Mutation(() => Auth)
    async biometricLogin(@Args('input') input: BiometricLoginInput) {
        return this.auth.biometricLogin(input);
    }
  
    // Protected route
    @Mutation(() => User)
    @UseGuards(GqlAuthGuard)
    async setBiometricData(
        @UserEntity() user: User,
        @Args("data") data: string
    ): Promise<User> {
        return await this.usersService.setBiometricKey(user.id, data);
    }
  
    @ResolveField('user', () => User)
    async user(@Parent() auth: Auth) {
      return await this.auth.getUserFromToken(auth.accessToken);
    }
  }
  