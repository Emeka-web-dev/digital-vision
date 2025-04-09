import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PasswordService } from './password.service';
import * as bcrypt from 'bcryptjs';

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

// Mock ConfigService
const mockConfigService = {
  get: jest.fn().mockImplementation((key) => {
    if (key === 'security') {
      return { bcryptSaltOrRound: 10 };
    }
    return null;
  }),
};

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('bcryptSaltRounds', () => {
    it('should return number when saltOrRounds is a number', () => {
      mockConfigService.get.mockReturnValueOnce({ bcryptSaltOrRound: 10 });
      
      expect(service.bcryptSaltRounds).toBe(10);
    });

    it('should return string when saltOrRounds is a string', () => {
      mockConfigService.get.mockReturnValueOnce({ bcryptSaltOrRound: '$2b$10$' });
      
      expect(service.bcryptSaltRounds).toBe('$2b$10$');
    });
  });

  describe('validatePassword', () => {
    it('should call bcrypt.compare and return true when password matches', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      
      const result = await service.validatePassword('password', 'hashed-password');
      
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashed-password');
      expect(result).toBeTruthy();
    });

    it('should call bcrypt.compare and return false when password does not match', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
      
      const result = await service.validatePassword('wrong-password', 'hashed-password');
      
      expect(bcrypt.compare).toHaveBeenCalledWith('wrong-password', 'hashed-password');
      expect(result).toBeFalsy();
    });
  });

  describe('hashPassword', () => {
    it('should call bcrypt.hash with password and salt rounds', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashed-password');
      
      const result = await service.hashPassword('password');
      
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(result).toBe('hashed-password');
    });
  });
});