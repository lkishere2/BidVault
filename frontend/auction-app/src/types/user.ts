import type { Page } from './pagination';

export interface UserResponse {
    username: string;
    email: string;
    balance: string;
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

export type PagedUsers = Page<UserResponse>;
