import { PrismaService } from 'nestjs-prisma';
import { Prisma, User } from '@prisma/client';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from './password.service';
import { SignupInput } from './dto/signup.input';
import { Token } from './models/token.model';
import { SecurityConfig } from '../common/configs/config.interface';
import { UsersService } from '../users/users.service';
import { BiometricLoginInput } from './dto/biometric-login.input';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService,
  ) { }

  async createUser(payload: SignupInput): Promise<Token> {
    try {
      const user = await this.usersService.createUser(payload.name, payload.email, payload.password);

      return this.generateTokens({
        userId: user.id,
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException(`Email ${payload.email} already used.`);
      }
      throw new Error(e.message || e);
    }
  }

  async login(email: string, password: string): Promise<Token> {
    const user = await this.usersService.findUserByEmail(email);
    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }

    const passwordValid = await this.passwordService.validatePassword(
      password,
      user.password,
    );

    if (!passwordValid) {
      throw new BadRequestException('Invalid password');
    }

    return this.generateTokens({
      userId: user.id,
    });
  }

  async biometricLogin(biometricInput: BiometricLoginInput) {
    const {biometricKey} = biometricInput;

    // Hash the biometric key
    const hashedBiometricKey = this.usersService.secureBiometricHash(biometricKey);

    // Check if the biometric key is valid
    const user = await this.usersService.findUserByBiometricKey(hashedBiometricKey);
    if (!user) {
        throw new UnauthorizedException('Invalid biometric key');
    }  

    return this.generateTokens({
      userId: user.id,
    })
    
  }


  validateUser(userId: string): Promise<User | null> {
    return this.usersService.findUserById(userId);
  }

  getUserFromToken(token: string): Promise<User | null> {
    const id = this.jwtService.decode(token)['userId'];
    return this.usersService.findUserById(id);
  }

  generateTokens(payload: { userId: string }): Token {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  private generateAccessToken(payload: { userId: string }): string {
    const securityConfig = this.configService.get<SecurityConfig>('security');
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: securityConfig?.expiresIn,
    });
  }

  private generateRefreshToken(payload: { userId: string }): string {
    const securityConfig = this.configService.get<SecurityConfig>('security');
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: securityConfig?.refreshIn,
    });
  }

  getRefreshToken(token: string) {
    try {
      const { userId } = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
      // check if userId is valid
      
      return this.generateTokens({
        userId,
      });
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
