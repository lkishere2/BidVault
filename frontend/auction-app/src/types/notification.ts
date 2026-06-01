export interface NotificationResponse {
    message: string;
    sendAt: string; // Khớp với LocalDateTime từ Backend (sẽ nhận về dạng ISO String)
}