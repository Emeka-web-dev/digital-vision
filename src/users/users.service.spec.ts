import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from 'nestjs-prisma';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

// Mock bcrypt and crypto
jest.mock('bcryptjs');
jest.mock('crypto', () => ({
  createHash: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnValue({
      digest: jest.fn().mockReturnValue('hashed-biometric-key'),
    }),
  }),
}));

// Mock implementations
const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

// Sample data
const mockUser = {
  id: 'user-id',
  email: 'test@example.com',
  name: 'Test User',
  password: 'hashed-password',
  biometricKey: 'hashed-biometric-key',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findUserByEmail', () => {
    it('should return a user when found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);
      
      const result = await service.findUserByEmail('test@example.com');
      
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);
      
      const result = await service.findUserByEmail('nonexistent@example.com');
      
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
      expect(result).toBeNull();
    });
  });

  describe('findUserById', () => {
    it('should return a user when found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);
      
      const result = await service.findUserById('user-id');
      
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);
      
      const result = await service.findUserById('nonexistent-id');
      
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'nonexistent-id' },
      });
      expect(result).toBeNull();
    });
  });

  describe('findUserByBiometricKey', () => {
    it('should return a user when found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);
      
      const result = await service.findUserByBiometricKey('hashed-biometric-key');
      
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { biometricKey: 'hashed-biometric-key' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);
      
      const result = await service.findUserByBiometricKey('nonexistent-key');
      
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { biometricKey: 'nonexistent-key' },
      });
      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create and return a user', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashed-password');
      mockPrismaService.user.create.mockResolvedValueOnce(mockUser);
      
      const result = await service.createUser('Test User', 'test@example.com', 'password123');
      
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'hashed-password',
        },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('setBiometricKey', () => {
    it('should update and return user with biometric key', async () => {
      mockPrismaService.user.update.mockResolvedValueOnce(mockUser);
      
      const result = await service.setBiometricKey('user-id', 'biometric-key');
      
      expect(crypto.createHash).toHaveBeenCalledWith('sha256');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: { biometricKey: 'hashed-biometric-key' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user is not found', async () => {
      mockPrismaService.user.update.mockResolvedValueOnce(null);
      
      await expect(service.setBiometricKey('nonexistent-id', 'biometric-key'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('secureBiometricHash', () => {
    it('should return hashed biometric key', () => {
      const result = service.secureBiometricHash('biometric-key');
      
      expect(crypto.createHash).toHaveBeenCalledWith('sha256');
      expect(result).toBe('hashed-biometric-key');
    });
  });
});