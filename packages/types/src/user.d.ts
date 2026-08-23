import { UserRole } from './enums';
export interface IUser {
    id: string;
    email: string | null;
    phone: string | null;
    passwordHash: string | null;
    role: UserRole;
    isActive: boolean;
    isVerified: boolean;
    googleId: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface IProfile {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface IUserWithProfile extends IUser {
    profile: IProfile | null;
}
export interface ICreateUser {
    email?: string;
    phone?: string;
    password?: string;
    role: UserRole;
    firstName: string;
    lastName: string;
}
export interface IUpdateProfile {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
}
//# sourceMappingURL=user.d.ts.map