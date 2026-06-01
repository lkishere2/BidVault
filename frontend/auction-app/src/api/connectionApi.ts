import api from './axios';
import type { UserStats } from '../types/connection';

export const connectionApi = {

    follow: (followingId: number) =>
        api.post<void>(`/api/v1/users/follow/${followingId}`),

    getStats: (userId: number) =>
        api.get<UserStats>(`/api/v1/users/${userId}/stats`),

    checkFollowStatus: (userId: number) =>
        api.get<boolean>(`/api/v1/users/${userId}/is-following`),

};

export default connectionApi;