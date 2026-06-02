import api from './axios';
import type { UserStats } from '../types/connection';

export const connectionApi = {
    follow: (followingId: number) => api.post<void>(`/users/follow/${followingId}`),
    getStats: (userId: number) => api.get<UserStats>(`/users/${userId}/stats`),
    checkFollowStatus: (userId: number) => api.get<boolean>(`/users/${userId}/is-following`),
};
export default connectionApi;