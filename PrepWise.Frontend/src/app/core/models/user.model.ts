export interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    createdAt: string;
    lastLoginAt?: string;
    isActive: boolean;
}

export interface AuthResult {
    success: boolean;
    message: string;
    token?: string;
    user?: User;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
} 