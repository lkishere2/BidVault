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

    getInfo: () =>
        api.get<UserResponse>('/users/info'),

    searchUsers: (username: string, page = 0, size = 20) =>
        api.get<Page<UserResponse>>(`/users/search?username=${encodeURIComponent(username)}&page=${page}&size=${size}`),

    updateUsername: (data: UsernameRequest) =>
        api.patch<void>('/users/update-username', data),

    updateEmail: (data: EmailRequest) =>
        api.patch<void>('/users/update-email', data),

    updatePassword: (data: PasswordRequest) =>
        api.patch<void>('/users/update-password', data),

    updateProfileImage: (data: ProfileImageRequest) =>
        api.patch<void>('/users/update-profile-image', data),

    getAllUsers: (page = 0, size = 20) =>
        api.get<Page<UserResponse>>(`/users/all?page=${page}&size=${size}`),

};

export default userApi;