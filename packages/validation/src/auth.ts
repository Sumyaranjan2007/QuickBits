import { z } from 'zod';
import { UserRole } from '@quickbite/types';
import { emailSchema, nameSchema, passwordSchema, phoneSchema } from './common';

export const registerSchema = z
  .object({
    email: emailSchema.optional(),
    phone: phoneSchema.optional(),
    password: passwordSchema,
    firstName: nameSchema,
    lastName: nameSchema,
    role: z.nativeEnum(UserRole),
  })
  .refine((data) => data.email || data.phone, {
    message: 'Either email or phone number is required',
  });

export const loginSchema = z
  .object({
    email: emailSchema.optional(),
    phone: phoneSchema.optional(),
    password: z.string().min(1, 'Password is required'),
  })
  .refine((data) => data.email || data.phone, {
    message: 'Either email or phone number is required',
  });

export const sendOTPSchema = z.object({
  phone: phoneSchema,
  role: z.nativeEnum(UserRole).optional(),
});

export const verifyOTPSchema = z.object({
  phone: phoneSchema,
  otp: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d+$/, 'OTP must contain only digits'),
  role: z.nativeEnum(UserRole).optional(),
});

export const googleAuthSchema = z.object({
  token: z.string().min(1, 'Google token is required'),
  role: z.nativeEnum(UserRole).optional(),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: passwordSchema,
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SendOTPInput = z.infer<typeof sendOTPSchema>;
export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>;
