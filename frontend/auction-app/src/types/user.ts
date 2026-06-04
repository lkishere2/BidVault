export interface UserResponse {
    id: number;
    username: string;
    email: string;
    balance: string;
    profileImageUrl?: string;
    role: 'ADMIN' | 'USER';
    followersCount?: number;
    followingCount?: number;
}

export interface UsernameRequest {
    username: string;
}

export interface EmailRequest {
    email: string;
}

export interface PasswordRequest {
    verificationCode: string;
    newPassword: string;
}

export interface ProfileImageRequest {
    profileImageUrl: string;
}