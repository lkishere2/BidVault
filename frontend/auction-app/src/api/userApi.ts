import api from './axios';
import type { Page } from '../types/pagination';
import type {
    UserResponse,
    UsernameRequest,
    EmailRequest,
    PasswordRequest,
    ProfileImageRequest
} from '../types/user';

export const userApi = {

    // 1. Lấy thông tin chi tiết của User hiện tại đang đăng nhập
    // Backend: @GetMapping("/info")
    getInfo: () =>
        api.get<UserResponse>('/api/v1/users/info'),

    // 2. Tìm kiếm danh sách người dùng theo Username (Có phân trang)
    // Backend: @GetMapping("/search")
    searchUsers: (username: string, page: number = 0, size: number = 20) =>
        api.get<Page<UserResponse>>('/api/v1/users/search', {
            params: {
                username,
                page,
                size
            }
        }),

    // 3. Cập nhật lại tên hiển thị (Username)
    // Backend: @PatchMapping("/update-username")
    updateUsername: (data: UsernameRequest) =>
        api.patch<void>('/api/v1/users/update-username', data),

    // 4. Cập nhật lại địa chỉ email tài khoản
    // Backend: @PatchMapping("/update-email")
    updateEmail: (data: EmailRequest) =>
        api.patch<void>('/api/v1/users/update-email', data),

    // 5. Đổi mật khẩu tài khoản
    // Backend: @PatchMapping("/update-password")
    updatePassword: (data: PasswordRequest) =>
        api.patch<void>('/api/v1/users/update-password', data),

    // 6. Cập nhật đường dẫn ảnh đại diện (Mới bổ sung)
    // Backend: @PatchMapping("/update-profile-image")
    updateProfileImage: (data: ProfileImageRequest) =>
        api.patch<void>('/api/v1/users/update-profile-image', data),

    // 7. [ADMIN] Lấy toàn bộ danh sách người dùng hệ thống (Có phân trang)
    // Backend: @GetMapping("/all")
    getAllUsers: (page: number = 0, size: number = 20) =>
        api.get<Page<UserResponse>>('/api/v1/users/all', {
            params: {
                page,
                size
            }
        }),

};

export default userApi;