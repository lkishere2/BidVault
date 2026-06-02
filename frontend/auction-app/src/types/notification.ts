export interface NotificationResponse {
    id: number;
    message: string;
    sendAt: string;
    hasRead: boolean;
}

export interface Notification {
    id: number;
    message: string;
    sendAt: string;
    read?: boolean;
}