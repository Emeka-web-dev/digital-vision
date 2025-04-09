import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PasswordService } from './password.service';
import { 
  NotFoundException, 
  BadRequestException, 
  UnauthorizedException, 
  ConflictException 
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { create } from 'domain';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;
  let passwordService: Partial<PasswordService>;
  let configService: Partial<ConfigService>;

  beforeEach(async () => {
    usersService = {
      findUserByEmail: jest.fn(),
      createUser: jest.fn(),
      findUserById: jest.fn(),
      findUserByBiometricKey: jest.fn(),
      secureBiometricHash: jest.fn().mockReturnValue('hashed-biometric-key')
    };

    jwtService = {
      sign: jest.fn().mockImplementation(() => 'mockedToken'),
      decode: jest.fn().mockReturnValue({ userId: 'mockedUserId' }),
      verify: jest.fn().mockReturnValue({ userId: 'mockedUserId' }),
    };

    passwordService = {
      validatePassword: jest.fn(),
    };

    configService = {
      get: jest.fn().mockImplementation((key) => {
        if (key === 'JWT_ACCESS_SECRET') return 'accessSecret';
        if (key === 'JWT_REFRESH_SECRET') return 'refreshSecret';
        if (key === 'security') return { expiresIn: '2m', refreshIn: '7d' };
        return null;
      })
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: PasswordService, useValue: passwordService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('createUser', () => {
    const signupInput = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
    };

    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedPassword',
      biometricKey: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a user and return tokens', async () => {
      jest.spyOn(usersService, 'createUser').mockResolvedValue(mockUser);

      const result = await authService.createUser(signupInput);

      expect(usersService.createUser).toHaveBeenCalledWith(
        signupInput.name,
        signupInput.email,
        signupInput.password
      );
      expect(result).toEqual({ accessToken: 'mockedToken', refreshToken: 'mockedToken' });
    });

   
    it('should throw a generic error for unexpected exceptions', async () => {
      jest.spyOn(usersService, 'createUser').mockRejectedValue(new Error('Unexpected error'));
    
      await expect(authService.createUser(signupInput))
        .rejects.toThrow(Error);
      
      expect(usersService.createUser).toHaveBeenCalledWith(
        signupInput.name,
        signupInput.email,
        signupInput.password
      );
    });
  });

  describe('login', () => {
    const mockEmail = 'john@example.com';
    const mockPassword = 'password123';
    
    const mockUser = {
      id: '1',
      email: 'john@example.com',
      password: 'hashedPassword',
      name: 'John Doe',
      biometricKey: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should login a user and return tokens', async () => {
      jest.spyOn(usersService, 'findUserByEmail').mockResolvedValue(mockUser);
      jest.spyOn(passwordService, 'validatePassword').mockResolvedValue(true);

      const result = await authService.login(mockEmail, mockPassword);

      expect(usersService.findUserByEmail).toHaveBeenCalledWith(mockEmail);
      expect(passwordService.validatePassword).toHaveBeenCalledWith(
        mockPassword,
        mockUser.password
      );
      expect(result).toEqual({ accessToken: 'mockedToken', refreshToken: 'mockedToken' });
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(usersService, 'findUserByEmail').mockResolvedValue(null);

      await expect(authService.login(mockEmail, mockPassword))
        .rejects.toThrow(NotFoundException);
      
      expect(usersService.findUserByEmail).toHaveBeenCalledWith(mockEmail);
    });

    it('should throw BadRequestException if password is invalid', async () => {
      jest.spyOn(usersService, 'findUserByEmail').mockResolvedValue(mockUser);
      jest.spyOn(passwordService, 'validatePassword').mockResolvedValue(false);

      await expect(authService.login(mockEmail, mockPassword))
        .rejects.toThrow(BadRequestException);
      
      expect(usersService.findUserByEmail).toHaveBeenCalledWith(mockEmail);
      expect(passwordService.validatePassword).toHaveBeenCalledWith(
        mockPassword,
        mockUser.password
      );
    });
  });

  describe('biometricLogin', () => {
    const biometricInput = { biometricKey: 'biometricKey' };
    
    const mockUser = {
      id: '1',
      biometricKey: 'hashed-biometricKey',
      email: 'john@example.com',
      name: 'John Doe',
      password: 'hashedPassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should login a user with a valid biometric key', async () => {
      jest.spyOn(usersService, 'secureBiometricHash').mockReturnValue('hashed-biometricKey');
      jest.spyOn(usersService, 'findUserByBiometricKey').mockResolvedValue(mockUser);
  
      const result = await authService.biometricLogin(biometricInput);
  
      expect(usersService.secureBiometricHash).toHaveBeenCalledWith('biometricKey');
      expect(usersService.findUserByBiometricKey).toHaveBeenCalledWith('hashed-biometricKey');
      expect(result).toEqual({ accessToken: 'mockedToken', refreshToken: 'mockedToken' });
    });
  
    it('should throw UnauthorizedException if biometric key is invalid', async () => {
      jest.spyOn(usersService, 'secureBiometricHash').mockReturnValue('hashed-biometricKey');
      jest.spyOn(usersService, 'findUserByBiometricKey').mockResolvedValue(null);
  
      await expect(authService.biometricLogin(biometricInput))
        .rejects.toThrow(UnauthorizedException);
      
      expect(usersService.secureBiometricHash).toHaveBeenCalledWith('biometricKey');
      expect(usersService.findUserByBiometricKey).toHaveBeenCalledWith('hashed-biometricKey');
    });
  });

  describe('validateUser', () => {
    it('should return a user when found', async () => {
      const mockUser = { 
        id: '1', 
        name: 'John Doe', 
        email: 'john@example.com', 
        password: 'hashedPassword', 
        biometricKey: null, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      };
      jest.spyOn(usersService, 'findUserById').mockResolvedValue(mockUser);

      const result = await authService.validateUser('1');

      expect(usersService.findUserById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not found', async () => {
      jest.spyOn(usersService, 'findUserById').mockResolvedValue(null);

      const result = await authService.validateUser('nonexistent');

      expect(usersService.findUserById).toHaveBeenCalledWith('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', () => {
      jest.spyOn(jwtService, 'sign').mockReturnValueOnce('accessToken').mockReturnValueOnce('refreshToken');

      const result = authService.generateTokens({ userId: '1' });

      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken'
      });
    });
  });

  describe('getRefreshToken', () => {
    it('should return new tokens from a valid refresh token', () => {
      jest.spyOn(jwtService, 'verify').mockReturnValue({ userId: '1' });
      jest.spyOn(jwtService, 'sign')
        .mockReturnValueOnce('newAccessToken')
        .mockReturnValueOnce('newRefreshToken');

      const result = authService.getRefreshToken('validRefreshToken');

      expect(jwtService.verify).toHaveBeenCalledWith('validRefreshToken', { 
        secret: 'refreshSecret' 
      });
      expect(result).toEqual({
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken'
      });
    });

    it('should throw UnauthorizedException if refresh token is invalid', () => {
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => authService.getRefreshToken('invalidToken')).toThrow(UnauthorizedException);
      
      expect(jwtService.verify).toHaveBeenCalledWith('invalidToken', { 
        secret: 'refreshSecret' 
      });
    });
  });
});