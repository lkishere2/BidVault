export const NOTIFICATION_SYNC_EVENT = 'app:notifications_sync';

export interface NotificationSyncPayload {
    action: 'toggle-read' | 'mark-all-read' | 'mark-all-unread';
    id?: number;
    currentReadStatus?: boolean;
}

export const broadcastNotificationChange = (payload: NotificationSyncPayload) => {
    window.dispatchEvent(new CustomEvent(NOTIFICATION_SYNC_EVENT, { detail: payload }));
};