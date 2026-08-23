import { UserRole } from './enums';
export interface ILoginRequest {
    email?: string;
    phone?: string;
    password: string;
}
export interface IRegisterRequest {
    email?: string;
    phone?: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
}
export interface ISendOTPRequest {
    phone: string;
    role?: UserRole;
}
export interface IVerifyOTPRequest {
    phone: string;
    otp: string;
    role?: UserRole;
}
export interface IGoogleAuthRequest {
    token: string;
    role?: UserRole;
}
export interface IForgotPasswordRequest {
    email: string;
}
export interface IResetPasswordRequest {
    token: string;
    newPassword: string;
}
export interface IRefreshTokenRequest {
    refreshToken: string;
}
export interface IAuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export interface IAuthResponse {
    user: {
        id: string;
        email: string | null;
        phone: string | null;
        role: UserRole;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
    };
    tokens: IAuthTokens;
}
//# sourceMappingURL=auth.d.ts.map