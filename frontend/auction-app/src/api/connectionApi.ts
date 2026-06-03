import api from './axios';

export const connectionApi = {
    follow: (followingId: number) => api.post<void>(`/users/follow/${followingId}`),
    checkFollowStatus: (userId: number) => api.get<boolean>(`/users/${userId}/is-following`),
};
export default connectionApi;