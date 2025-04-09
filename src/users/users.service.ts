import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import * as bcrypt from 'bcryptjs';
import * as crypto from "crypto";

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async findUserByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
        })
    }

    async findUserById(id: string) {
        return this.prisma.user.findUnique({
            where: { id },
        })
    }

    async findUserByBiometricKey(biometricKey: string) {
        return this.prisma.user.findUnique({
            where: { biometricKey },
        })
    }

    async createUser(name: string, email: string, password: string) {
        const hashedPassword = await bcrypt.hash(password, 10);
        return this.prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        })
    }

    async setBiometricKey(userId: string, biometricToken: string) {
        // Hash the biometric token
        const hashedBiometricKey = this.secureBiometricHash(biometricToken);
    
        // Update the user's biometric key in the database
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: { biometricKey: hashedBiometricKey },
        });
    
        if (!user) {
            throw new NotFoundException(`No user found for ID: ${userId}`);
        }    
        return user;
    }
    
    private secureBiometricHash(biometricInput: string): string {
        return crypto
            .createHash('sha256')
            .update(biometricInput)
            .digest('hex');
    }

}