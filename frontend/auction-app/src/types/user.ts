export interface UserResponse {
    id: number;
    username: string;
    email: string;
    balance: string;
    profileImageUrl?: string;
}

export interface UsernameRequest {
    username: string;
}

export interface EmailRequest {
    email: string;
}

export interface PasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export interface ProfileImageRequest {
    profileImageUrl: string;
}