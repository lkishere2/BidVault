import api from './axios';

export const connectionApi = {
    follow: (followingId: number) => api.post<void>(`/api/v1/users/follow/${followingId}`),
    checkFollowStatus: (userId: number) => api.get<boolean>(`/api/v1/users/${userId}/is-following`),
};
export default connectionApi;