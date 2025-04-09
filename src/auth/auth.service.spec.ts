import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PasswordService } from './password.service';
import { NotFoundException, BadRequestException, UnauthorizedException, ConflictException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;
  let passwordService: Partial<PasswordService>;

  beforeEach(async () => {
    usersService = {
      findUserByEmail: jest.fn(),
      createUser: jest.fn(),
      findUserById: jest.fn(),
      findUserByBiometricKey: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mockedToken'),
      decode: jest.fn().mockReturnValue({ userId: 'mockedUserId' }),
      verify: jest.fn().mockReturnValue({ userId: 'mockedUserId' }),
    };

    passwordService = {
      validatePassword: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: PasswordService, useValue: passwordService },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('mockedSecret') } },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user and return tokens', async () => {
      const mockUser = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        biometricKey: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(usersService, 'createUser').mockResolvedValue(mockUser);

      const result = await authService.createUser({ name: 'John Doe', email: 'john@example.com', password: 'password' });

      expect(usersService.createUser).toHaveBeenCalledWith('John Doe', 'john@example.com', 'password');
      expect(result).toEqual({ accessToken: 'mockedToken', refreshToken: 'mockedToken' });
    });

    it('should throw a generic error for unexpected exceptions', async () => {
      jest.spyOn(usersService, 'createUser').mockRejectedValue(new Error('Unexpected error'));
    
      await expect(
        authService.createUser({ name: 'John Doe', email: 'john@example.com', password: 'password' }),
      ).rejects.toThrow(Error);
    });
  });

  describe('login', () => {
    it('should login a user and return tokens', async () => {
      const mockUser = {
        id: '1',
        email: 'john@example.com',
        password: 'hashedPassword',
        name: 'John Doe',
        biometricKey: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(usersService, 'findUserByEmail').mockResolvedValue(mockUser);
      jest.spyOn(passwordService, 'validatePassword').mockResolvedValue(true);

      const result = await authService.login('john@example.com', 'password');

      expect(usersService.findUserByEmail).toHaveBeenCalledWith('john@example.com');
      expect(passwordService.validatePassword).toHaveBeenCalledWith('password', 'hashedPassword');
      expect(result).toEqual({ accessToken: 'mockedToken', refreshToken: 'mockedToken' });
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(usersService, 'findUserByEmail').mockResolvedValue(null);

      await expect(authService.login('john@example.com', 'password')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if password is invalid', async () => {
      const mockUser = {
        id: '1',
        email: 'john@example.com',
        password: 'hashedPassword',
        name: 'John Doe',
        biometricKey: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(usersService, 'findUserByEmail').mockResolvedValue(mockUser);
      jest.spyOn(passwordService, 'validatePassword').mockResolvedValue(false);

      await expect(authService.login('john@example.com', 'password')).rejects.toThrow(BadRequestException);
    });
  });

  // describe('biometricLogin', () => {
  //   it('should login a user with a valid biometric key', async () => {
  //     const mockUser = {
  //       id: '1',
  //       biometricKey: 'hashed-biometricKey',
  //       email: 'john@example.com',
  //       name: 'John Doe',
  //       password: 'hashedPassword',
  //       createdAt: new Date(),
  //       updatedAt: new Date(),
  //     };
  //     jest.spyOn(usersService, 'findUserByBiometricKey').mockResolvedValue(mockUser);
  
  //     const result = await authService.biometricLogin({ biometricKey: 'biometricKey' });
  
  //     expect(usersService.secureBiometricHash).toHaveBeenCalledWith('biometricKey');
  //     expect(usersService.findUserByBiometricKey).toHaveBeenCalledWith('hashed-biometricKey');
  //     expect(result).toEqual({ accessToken: 'mockedToken', refreshToken: 'mockedToken' });
  //   });
  
  //   it('should throw UnauthorizedException if biometric key is invalid', async () => {
  //     jest.spyOn(usersService, 'findUserByBiometricKey').mockResolvedValue(null);
  
  //     await expect(authService.biometricLogin({ biometricKey: 'invalidKey' })).rejects.toThrow(UnauthorizedException);
  //   });
  // });
//   describe('getUserFromToken', () => {
//     it('should return a user from a valid token', async () => {
//       const mockUser = { id: '1', name: 'John Doe' };
//       jest.spyOn(usersService, 'findUserById').mockResolvedValue(mockUser);

//       const result = await authService.getUserFromToken('validToken');

//       expect(jwtService.decode).toHaveBeenCalledWith('validToken');
//       expect(usersService.findUserById).toHaveBeenCalledWith('mockedUserId');
//       expect(result).toEqual(mockUser);
//     });
//   });

//   describe('getRefreshToken', () => {
//     it('should return new tokens from a valid refresh token', () => {
//       const result = authService.getRefreshToken('validRefreshToken');

//       expect(jwtService.verify).toHaveBeenCalledWith('validRefreshToken', { secret: 'mockedSecret' });
//       expect(result).toEqual({ accessToken: 'mockedToken', refreshToken: 'mockedToken' });
//     });

//     it('should throw UnauthorizedException if refresh token is invalid', () => {
//       jest.spyOn(jwtService, 'verify').mockImplementation(() => {
//         throw new Error();
//       });

//       expect(() => authService.getRefreshToken('invalidToken')).toThrow(UnauthorizedException);
//     });
//   });
});