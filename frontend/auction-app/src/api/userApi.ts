import api from './axios';
import type {
    UserResponse,
    UsernameRequest,
    EmailRequest,
    PasswordRequest,
    PagedUsers,
} from '../types/user';

export const userApi = {
    getMe: () => api.get('/users/me'),

    getInfo: () => api.get<UserResponse>('/users/info'),

    updateUsername: (data: UsernameRequest) =>
        api.patch<void>('/users/update-username', data),

    updateEmail: (data: EmailRequest) =>
        api.patch<void>('/users/update-email', data),

    updatePassword: (data: PasswordRequest) =>
        api.patch<void>('/users/update-password', data),

    getAllUsers: (page = 0, size = 10) =>
        api.get<PagedUsers>('/users/admin/all', { params: { page, size } }),

    disableUser: (id: number) => api.patch<void>(`/users/admin/disable/${id}`),
};

export default userApi;
