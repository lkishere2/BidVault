export interface UserResponse {
    id: number;                // Khớp với Long id từ Backend
    username: string;
    email: string;
    balance: string;           // Khớp với BigDecimal dạng số bên Backend
    profileImageUrl?: string;  // Khớp với trường ảnh đại diện từ Backend
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