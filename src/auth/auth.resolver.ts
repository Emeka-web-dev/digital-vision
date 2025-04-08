import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { BiometricLoginInput } from './dto/biometric-login.input';
import { AuthResponse, RegisterResponse } from './dto/auth.types';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/models/user.model';

@Resolver()
export class AuthResolver {
    constructor(private authService: AuthService) { }

    @Mutation(() => AuthResponse)
    async register(@Args('input') input: RegisterInput): Promise<RegisterResponse> {       
        return this.authService.register(input);
    }

    @Mutation(() => AuthResponse)
    async login(@Args('input') input: LoginInput): Promise<AuthResponse> {
        return this.authService.login(input);
    }

    @Mutation(() => AuthResponse)
    async biometricLogin(@Args('input') input: BiometricLoginInput): Promise<AuthResponse> {
        return this.authService.biometricLogin(input);
    }

    @Mutation(() => User)
    @UseGuards(JwtAuthGuard)
    async setBiometricKey(
        @CurrentUser() user: User,
        @Args('biometricKey') biometricKey: string,
    ): Promise<User> {
        return this.authService.updateBiometricKey(user.id, biometricKey);
    }

    @Query(() => User)
    @UseGuards(JwtAuthGuard)
    async me(@CurrentUser() user: User): Promise<User> {
        return user;
    }
}