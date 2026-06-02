import api from "./axios";
import type { Slice } from "../types/pagination";
import type { NotificationResponse } from "../types/notification";

export const notificationApi = {
    getMyNotificationsFeed: (page: number = 0, size: number = 20) => api.get<Slice<NotificationResponse>>('/notifications/feed', { params: { page, size } }),
    markAsRead: (id: number) => api.post<void>(`/notifications/${id}/read`),
    markAllAsRead: () => api.post<void>('/notifications/read-all'),
    markAsUnread: (id: number) => api.post<void>(`/notifications/${id}/unread`),
    markAllAsUnread: () => api.post<void>('/notifications/unread-all'),
};
export default notificationApi;