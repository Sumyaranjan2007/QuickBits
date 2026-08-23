"use strict";
/**
 * Platform-wide constants for QuickBite.
 * These values can be overridden by environment config at runtime where appropriate.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.APP_VERSION = exports.APP_DESCRIPTION = exports.APP_NAME = exports.AUTH_RATE_LIMIT_MAX_REQUESTS = exports.RATE_LIMIT_MAX_REQUESTS = exports.RATE_LIMIT_WINDOW_MS = exports.REFRESH_TOKEN_EXPIRY = exports.ACCESS_TOKEN_EXPIRY = exports.DEFAULT_PER_USER_COUPON_LIMIT = exports.MAX_COUPON_CODE_LENGTH = exports.MAX_RATING = exports.MIN_RATING = exports.ALLOWED_IMAGE_TYPES = exports.MAX_FILE_SIZE_MB = exports.MAX_PAGE_SIZE = exports.DEFAULT_PAGE_SIZE = exports.OTP_RESEND_COOLDOWN_SECONDS = exports.OTP_MAX_ATTEMPTS = exports.OTP_EXPIRY_MINUTES = exports.OTP_LENGTH = exports.DELIVERY_ASSIGNMENT_TIMEOUT_SECONDS = exports.MAX_DELIVERY_ASSIGNMENT_ATTEMPTS = exports.DELIVERY_PARTNER_SEARCH_RADIUS_KM = exports.DELIVERY_RADIUS_KM = exports.DEFAULT_DELIVERY_FEE = exports.TAX_RATE = exports.DEFAULT_COMMISSION_RATE = exports.PLATFORM_FEE_PERCENTAGE = void 0;
// ─── Platform Fees ──────────────────────────────────────
exports.PLATFORM_FEE_PERCENTAGE = 5; // 5% platform fee
exports.DEFAULT_COMMISSION_RATE = 20; // 20% restaurant commission
exports.TAX_RATE = 5; // 5% GST
exports.DEFAULT_DELIVERY_FEE = 30; // ₹30 base delivery fee
// ─── Delivery ───────────────────────────────────────────
exports.DELIVERY_RADIUS_KM = 15; // Max delivery radius
exports.DELIVERY_PARTNER_SEARCH_RADIUS_KM = 5;
exports.MAX_DELIVERY_ASSIGNMENT_ATTEMPTS = 3;
exports.DELIVERY_ASSIGNMENT_TIMEOUT_SECONDS = 60;
// ─── OTP ────────────────────────────────────────────────
exports.OTP_LENGTH = 6;
exports.OTP_EXPIRY_MINUTES = 5;
exports.OTP_MAX_ATTEMPTS = 3;
exports.OTP_RESEND_COOLDOWN_SECONDS = 60;
// ─── Pagination ─────────────────────────────────────────
exports.DEFAULT_PAGE_SIZE = 20;
exports.MAX_PAGE_SIZE = 100;
// ─── File Upload ────────────────────────────────────────
exports.MAX_FILE_SIZE_MB = 5;
exports.ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
// ─── Rating ─────────────────────────────────────────────
exports.MIN_RATING = 1;
exports.MAX_RATING = 5;
// ─── Coupon ─────────────────────────────────────────────
exports.MAX_COUPON_CODE_LENGTH = 20;
exports.DEFAULT_PER_USER_COUPON_LIMIT = 1;
// ─── Session ────────────────────────────────────────────
exports.ACCESS_TOKEN_EXPIRY = '7d';
exports.REFRESH_TOKEN_EXPIRY = '30d';
// ─── Rate Limiting ──────────────────────────────────────
exports.RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
exports.RATE_LIMIT_MAX_REQUESTS = 100;
exports.AUTH_RATE_LIMIT_MAX_REQUESTS = 10;
// ─── App Info ───────────────────────────────────────────
exports.APP_NAME = 'QuickBite';
exports.APP_DESCRIPTION = 'Your favourite food, delivered fast.';
exports.APP_VERSION = '1.0.0';
//# sourceMappingURL=constants.js.map