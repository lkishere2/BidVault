import api from "./axios";
import type { Slice } from "../types/pagination";
import type { NotificationResponse } from "../types/notification";

export const notificationApi = {
    getMyNotificationsFeed: (page: number = 0, size: number = 20) => api.get<Slice<NotificationResponse>>('/notifications/feed', { params: { page, size } }),
};
export default notificationApi;