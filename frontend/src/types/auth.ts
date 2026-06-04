export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface EmailRequest {
    email: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RefreshRequest {
    refreshToken: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface ResetPasswordRequest {
    email: string;
    password: string;
}

export interface VerifyRequest {
    email: string;
    verificationCode: string;
}