import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { BiometricLoginInput } from './dto/biometric-login.input';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    async register(registerInput: RegisterInput) {
        const { name, email, password } = registerInput;
        const existingUser = await this.usersService.findUserByEmail(email);

        // Check if user already exists
        if (existingUser) {
            throw new UnauthorizedException('Email already in use');
        }
        const user = await this.usersService.createUser(name, email, password);
        const token = this.generateToken(user.id).access_token;
        return { user, token };
    }

    async login(loginInput: LoginInput) {
        const { email, password } = loginInput;
        const user = await this.usersService.findUserByEmail(email);

        // Check if user exists and password is correct
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Remove password from user object before returning
        const token = this.generateToken(user.id).access_token;
        const { password: _, ...userWithoutPassword } = user;

        return { user: userWithoutPassword, token };

    }

    async biometricLogin(biometricLoginInput: BiometricLoginInput) {
        const { biometricKey } = biometricLoginInput;

        // Check if the biometric key is valid
        const user = await this.usersService.findUserByBiometricKey(biometricKey);
        if (!user) {
            throw new UnauthorizedException('Invalid biometric key');
        }

        const { password: _, ...userWithoutPassword } = user;
        const token = this.generateToken(user.id).access_token;

        return { user: userWithoutPassword, token };
    }

    async updateBiometricKey(userId: string, biometricKey: string) {
        // Check if the biometric key is valid
        const existingUser = await this.usersService.findUserByBiometricKey(biometricKey);
        if (existingUser && existingUser.id !== userId) {
            throw new UnauthorizedException('Biometric key already in use');
        }
        const user = await this.usersService.updateUserBiometricKey(userId, biometricKey);
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword as User;
    }

    async validateUser(userId: string) {
        return this.usersService.findUserById(userId);
    }

    private generateToken(user: any) {
        const payload = { id: user.id, email: user.email };
        return {
            access_token: this.jwtService.sign(payload),
            user,
        };
    }
}