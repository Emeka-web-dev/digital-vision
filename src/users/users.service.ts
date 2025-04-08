import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}
    
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

    async updateUserBiometricKey(userId: string, biometricKey: string) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { biometricKey },
        })
    }

    async updateUserPassword(userId: string, password: string) {
        const hashedPassword = await bcrypt.hash(password, 10);
        return this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        })
    }

    async deleteUser(userId: string) {
        return this.prisma.user.delete({
            where: { id: userId },
        })
    }
}