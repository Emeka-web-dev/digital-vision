import { Test, TestingModule } from '@nestjs/testing';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { SignupInput } from './dto/signup.input';
import { LoginInput } from './dto/login.input';
import { BiometricLoginInput } from './dto/biometric-login.input';
import { User } from '@prisma/client';
import { RefreshTokenInput } from './dto/refresh-token.input';

// Mock implementations
const mockAuthService = {
  createUser: jest.fn(),
  login: jest.fn(),
  refreshToken: jest.fn(),
  biometricLogin: jest.fn(),
  getUserFromToken: jest.fn(),
};

const mockUsersService = {
  setBiometricKey: jest.fn(),
};

// Sample data
const mockUser: User = {
  id: 'user-id',
  email: 'test@example.com',
  name: 'Test User',
  password: 'hashed-password',
  biometricKey: 'hashed-biometric-key',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockTokens = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
};

describe('AuthResolver', () => {
  let resolver: AuthResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        { provide: AuthService, useValue: mockAuthService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('signup', () => {
    const signupInput: SignupInput = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    it('should call authService.createUser and return tokens', async () => {
      mockAuthService.createUser.mockResolvedValueOnce(mockTokens);
      
      const result = await resolver.signup(signupInput);
      
      expect(mockAuthService.createUser).toHaveBeenCalledWith({
        ...signupInput,
        email: signupInput.email.toLowerCase(),
      });
      expect(result).toEqual(mockTokens);
    });
  });

  describe('login', () => {
    const loginInput: LoginInput = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should call authService.login and return tokens', async () => {
      mockAuthService.login.mockResolvedValueOnce(mockTokens);
      
      const result = await resolver.login(loginInput);
      
      expect(mockAuthService.login).toHaveBeenCalledWith(
        loginInput.email.toLowerCase(),
        loginInput.password,
      );
      expect(result).toEqual(mockTokens);
    });
  });


  describe('biometricLogin', () => {
    const biometricLoginInput: BiometricLoginInput = {
      biometricKey: 'biometric-key',
    };

    it('should call authService.biometricLogin and return tokens', async () => {
      mockAuthService.biometricLogin.mockResolvedValueOnce(mockTokens);
      
      const result = await resolver.biometricLogin(biometricLoginInput);
      
      expect(mockAuthService.biometricLogin).toHaveBeenCalledWith(biometricLoginInput);
      expect(result).toEqual(mockTokens);
    });
  });

  describe('setBiometricData', () => {
    it('should call usersService.setBiometricKey and return updated user', async () => {
      mockUsersService.setBiometricKey.mockResolvedValueOnce(mockUser);
      
      const result = await resolver.setBiometricData(mockUser, 'biometric-key');
      
      expect(mockUsersService.setBiometricKey).toHaveBeenCalledWith(mockUser.id, 'biometric-key');
      expect(result).toEqual(mockUser);
    });
  });

});