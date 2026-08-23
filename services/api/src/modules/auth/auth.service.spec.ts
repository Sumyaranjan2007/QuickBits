import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../../database/entities/user.entity';
import { ProfileEntity } from '../../database/entities/profile.entity';
import { CustomerEntity } from '../../database/entities/customer.entity';
import { DeliveryPartnerEntity } from '../../database/entities/delivery-partner.entity';
import { UserRole } from '@quickbite/types';

describe('AuthService', () => {
  let service: AuthService;

  const mockUserRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockProfileRepo = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockCustomerRepo = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockDeliveryPartnerRepo = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mock-token'),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        'jwt.secret': 'test-secret',
        'jwt.expiration': '7d',
        'jwt.refreshSecret': 'test-refresh-secret',
        'jwt.refreshExpiration': '30d',
        'nodeEnv': 'development',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(UserEntity), useValue: mockUserRepo },
        { provide: getRepositoryToken(ProfileEntity), useValue: mockProfileRepo },
        { provide: getRepositoryToken(CustomerEntity), useValue: mockCustomerRepo },
        { provide: getRepositoryToken(DeliveryPartnerEntity), useValue: mockDeliveryPartnerRepo },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new customer', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.CUSTOMER,
      };

      mockUserRepo.findOne.mockResolvedValue(null);
      mockUserRepo.create.mockReturnValue({ id: 'user-id', ...dto });
      mockUserRepo.save.mockResolvedValue({
        id: 'user-id',
        email: dto.email,
        role: UserRole.CUSTOMER,
        isActive: true,
        isVerified: false,
      });
      mockProfileRepo.create.mockReturnValue({ userId: 'user-id' });
      mockProfileRepo.save.mockResolvedValue({
        userId: 'user-id',
        firstName: dto.firstName,
        lastName: dto.lastName,
      });
      mockCustomerRepo.create.mockReturnValue({ userId: 'user-id' });
      mockCustomerRepo.save.mockResolvedValue({ userId: 'user-id' });

      const result = await service.register(dto);

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.tokens).toBeDefined();
      expect(result.tokens.accessToken).toBe('mock-token');
    });

    it('should throw ConflictException if user already exists', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 'existing-user' });

      await expect(
        service.register({
          email: 'existing@example.com',
          password: 'Password123',
          firstName: 'Test',
          lastName: 'User',
          role: UserRole.CUSTOMER,
        }),
      ).rejects.toThrow('User with this email or phone already exists');
    });
  });

  describe('sendOTP', () => {
    it('should generate and store OTP', async () => {
      const result = await service.sendOTP({ phone: '+919876543210' });

      expect(result).toBeDefined();
      expect(result.message).toBe('OTP sent successfully');
      expect(result.otp).toBeDefined(); // In development mode, OTP is returned
      expect(result.otp).toHaveLength(6);
    });
  });
});
