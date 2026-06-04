import api from './axios';
import type { Page } from '../types/pagination';
import type { UserResponse, UsernameRequest, EmailRequest, PasswordRequest, ProfileImageRequest } from '../types/user';

export const userApi = {
    getInfo: () => api.get<UserResponse>('/api/v1/users/info'),
    getUserById: (id: number) => api.get<UserResponse>(`/api/v1/users/${id}`),
    searchUsers: (username: string, page = 0, size = 20) => api.get<Page<UserResponse>>(`/api/v1/users/search?username=${encodeURIComponent(username)}&page=${page}&size=${size}`),
    updateUsername: (data: UsernameRequest) => api.patch<void>('/api/v1/users/update-username', data),
    updatePassword: (data: PasswordRequest) => api.patch<void>('/api/v1/users/update-password', data),
    updateProfileImage: (data: ProfileImageRequest) => api.patch<void>('/api/v1/users/update-profile-image', data),
    getAllUsers: (page = 0, size = 20) => api.get<Page<UserResponse>>(`/api/v1/users/all?page=${page}&size=${size}`),
    getTopUsers: () => api.get<UserResponse[]>('/api/v1/users/top'),
    updateRole: (id: number, role: string) => api.patch<void>(`/api/v1/users/${id}/role?role=${role}`),
};
export default userApi;