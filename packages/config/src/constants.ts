/**
 * Platform-wide constants for QuickBite.
 * These values can be overridden by environment config at runtime where appropriate.
 */

// ─── Platform Fees ──────────────────────────────────────
export const PLATFORM_FEE_PERCENTAGE = 5; // 5% platform fee
export const DEFAULT_COMMISSION_RATE = 20; // 20% restaurant commission
export const TAX_RATE = 5; // 5% GST
export const DEFAULT_DELIVERY_FEE = 30; // ₹30 base delivery fee

// ─── Delivery ───────────────────────────────────────────
export const DELIVERY_RADIUS_KM = 15; // Max delivery radius
export const DELIVERY_PARTNER_SEARCH_RADIUS_KM = 5;
export const MAX_DELIVERY_ASSIGNMENT_ATTEMPTS = 3;
export const DELIVERY_ASSIGNMENT_TIMEOUT_SECONDS = 60;

// ─── OTP ────────────────────────────────────────────────
export const OTP_LENGTH = 6;
export const OTP_EXPIRY_MINUTES = 5;
export const OTP_MAX_ATTEMPTS = 3;
export const OTP_RESEND_COOLDOWN_SECONDS = 60;

// ─── Pagination ─────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// ─── File Upload ────────────────────────────────────────
export const MAX_FILE_SIZE_MB = 5;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// ─── Rating ─────────────────────────────────────────────
export const MIN_RATING = 1;
export const MAX_RATING = 5;

// ─── Coupon ─────────────────────────────────────────────
export const MAX_COUPON_CODE_LENGTH = 20;
export const DEFAULT_PER_USER_COUPON_LIMIT = 1;

// ─── Session ────────────────────────────────────────────
export const ACCESS_TOKEN_EXPIRY = '7d';
export const REFRESH_TOKEN_EXPIRY = '30d';

// ─── Rate Limiting ──────────────────────────────────────
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_MAX_REQUESTS = 100;
export const AUTH_RATE_LIMIT_MAX_REQUESTS = 10;

// ─── App Info ───────────────────────────────────────────
export const APP_NAME = 'QuickBite';
export const APP_DESCRIPTION = 'Your favourite food, delivered fast.';
export const APP_VERSION = '1.0.0';
