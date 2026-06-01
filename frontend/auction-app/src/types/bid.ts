export interface BidRequest {
    amount: string; // Khớp với BigDecimal (hoặc string nếu bạn chuộng ép chuỗi)
}

export interface BidResponse {
    bidId: number;
    auctionId: number;
    bidderLabel: string;
    amount: string;  // Đồng bộ với backend
    placedAt: string; // ISO String tương ứng với Instant
}

export interface BidNotificationPayload {
    auctionId: number;
    currentPrice: string;
    minNextBid: string;
    bidderLabel: string;
    endTime: string;
    extended: boolean;
    bidCount: number;
    ended: boolean;
}

export interface PendingBid {
    bidId: number;
    auctionId: number;
    bidderId: number;
    bidderLabel: string;
    amount: string;
    placedAt: string;
}