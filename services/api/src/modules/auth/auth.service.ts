import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '@quickbite/types';
import { OTP_EXPIRY_MINUTES, OTP_LENGTH } from '@quickbite/config';
import { UserEntity } from '../../database/entities/user.entity';
import { ProfileEntity } from '../../database/entities/profile.entity';
import { CustomerEntity } from '../../database/entities/customer.entity';
import { DeliveryPartnerEntity } from '../../database/entities/delivery-partner.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SendOtpDto, VerifyOtpDto } from './dto/otp.dto';

/**
 * In-memory OTP store for development.
 * In production, use Redis or a dedicated OTP service.
 */
interface StoredOTP {
  otp: string;
  phone: string;
  role: UserRole;
  expiresAt: Date;
  attempts: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly otpStore = new Map<string, StoredOTP>();

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity)
    private readonly profileRepository: Repository<ProfileEntity>,
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>,
    @InjectRepository(DeliveryPartnerEntity)
    private readonly deliveryPartnerRepository: Repository<DeliveryPartnerEntity>,
    @Inject(JwtService)
    private readonly jwtService: JwtService,
    @Inject(ConfigService)
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    // Check for existing user
    const existingUser = await this.findUserByEmailOrPhone(dto.email, dto.phone);
    if (existingUser) {
      throw new ConflictException('User with this email or phone already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Create user
    const user = this.userRepository.create({
      email: dto.email || null,
      phone: dto.phone || null,
      passwordHash,
      role: dto.role,
      isActive: true,
      isVerified: false,
    });
    const savedUser = await this.userRepository.save(user);

    // Create profile
    const profile = this.profileRepository.create({
      userId: savedUser.id,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });
    await this.profileRepository.save(profile);

    // Create role-specific record
    if (dto.role === UserRole.CUSTOMER) {
      const customer = this.customerRepository.create({ userId: savedUser.id });
      await this.customerRepository.save(customer);
    }

    // Generate tokens
    const tokens = await this.generateTokens(savedUser);

    // Store refresh token
    await this.userRepository.update(savedUser.id, {
      refreshToken: tokens.refreshToken,
    });

    this.logger.log(`User registered: ${savedUser.id} (${dto.role})`);

    return {
      user: this.sanitizeUser(savedUser, profile),
      tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.findUserByEmailOrPhone(dto.email, dto.phone);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account has been deactivated');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('Please use OTP or Google sign-in');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);
    await this.userRepository.update(user.id, { refreshToken: tokens.refreshToken });

    this.logger.log(`User logged in: ${user.id}`);

    return {
      user: this.sanitizeUser(user, user.profile),
      tokens,
    };
  }

  async sendOTP(dto: SendOtpDto) {
    const otp = this.generateOTP();
    const role = dto.role || UserRole.CUSTOMER;

    const storedOtp: StoredOTP = {
      otp,
      phone: dto.phone,
      role,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
      attempts: 0,
    };

    this.otpStore.set(dto.phone, storedOtp);

    // In development, log the OTP. In production, use an SMS provider.
    this.logger.log(`[MOCK SMS] OTP for ${dto.phone}: ${otp}`);

    return {
      message: 'OTP sent successfully',
      // Only include OTP in development for testing convenience
      ...(this.configService.get('nodeEnv') === 'development' && { otp }),
    };
  }

  async verifyOTP(dto: VerifyOtpDto) {
    const stored = this.otpStore.get(dto.phone);

    if (!stored) {
      throw new BadRequestException('No OTP found. Please request a new one.');
    }

    if (new Date() > stored.expiresAt) {
      this.otpStore.delete(dto.phone);
      throw new BadRequestException('OTP has expired. Please request a new one.');
    }

    if (stored.attempts >= 3) {
      this.otpStore.delete(dto.phone);
      throw new BadRequestException('Too many attempts. Please request a new OTP.');
    }

    if (stored.otp !== dto.otp) {
      stored.attempts++;
      throw new BadRequestException('Invalid OTP');
    }

    // OTP verified — clean up
    this.otpStore.delete(dto.phone);

    // Find or create user
    let user = await this.userRepository.findOne({
      where: { phone: dto.phone },
      relations: ['profile'],
    });

    if (!user) {
      const role = dto.role || stored.role;
      user = this.userRepository.create({
        phone: dto.phone,
        role,
        isActive: true,
        isVerified: true,
      });
      user = await this.userRepository.save(user);

      // Create minimal profile
      const profile = this.profileRepository.create({
        userId: user.id,
        firstName: 'User',
        lastName: dto.phone.slice(-4),
      });
      await this.profileRepository.save(profile);
      user.profile = profile;

      if (role === UserRole.CUSTOMER) {
        const customer = this.customerRepository.create({ userId: user.id });
        await this.customerRepository.save(customer);
      }

      this.logger.log(`New user created via OTP: ${user.id} (${role})`);
    } else {
      // Mark as verified
      if (!user.isVerified) {
        await this.userRepository.update(user.id, { isVerified: true });
      }
    }

    const tokens = await this.generateTokens(user);
    await this.userRepository.update(user.id, { refreshToken: tokens.refreshToken });

    return {
      user: this.sanitizeUser(user, user.profile),
      tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('jwt.refreshSecret'),
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
        relations: ['profile'],
      });

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user);
      await this.userRepository.update(user.id, { refreshToken: tokens.refreshToken });

      return { tokens };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string) {
    await this.userRepository.update(userId, { refreshToken: null });
    this.logger.log(`User logged out: ${userId}`);
    return { message: 'Logged out successfully' };
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.sanitizeUser(user, user.profile);
  }

  async validateUser(userId: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { id: userId, isActive: true },
      relations: ['profile'],
    });
  }

  // ─── Private Helpers ──────────────────────────────────

  private async findUserByEmailOrPhone(
    email?: string,
    phone?: string,
  ): Promise<UserEntity | null> {
    if (email) {
      return this.userRepository.findOne({
        where: { email },
        relations: ['profile'],
      });
    }
    if (phone) {
      return this.userRepository.findOne({
        where: { phone },
        relations: ['profile'],
      });
    }
    return null;
  }

  private async generateTokens(user: UserEntity) {
    const payload = { sub: user.id, role: user.role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.refreshSecret'),
        expiresIn: this.configService.get('jwt.refreshExpiration'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
    };
  }

  private generateOTP(): string {
    return Math.random()
      .toString()
      .slice(2, 2 + OTP_LENGTH)
      .padStart(OTP_LENGTH, '0');
  }

  private sanitizeUser(user: UserEntity, profile: ProfileEntity | null) {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      avatarUrl: profile?.avatarUrl || null,
      isVerified: user.isVerified,
    };
  }
}
