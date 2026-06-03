import api from "./axios";
import type { Slice } from "../types/pagination";
import type { NotificationResponse } from "../types/notification";

export const notificationApi = {
    getMyNotificationsFeed: (page: number = 0, size: number = 20) => api.get<Slice<NotificationResponse>>('/api/v1/notifications/feed', { params: { page, size } }),
    markAsRead: (id: number) => api.post<void>(`/api/v1/notifications/${id}/read`),
    markAllAsRead: () => api.post<void>('/api/v1/notifications/read-all'),
    markAsUnread: (id: number) => api.post<void>(`/api/v1/notifications/${id}/unread`),
    markAllAsUnread: () => api.post<void>('/api/v1/notifications/unread-all'),
};
export default notificationApi;