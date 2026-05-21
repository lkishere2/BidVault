export interface BidRequest {
    amount: string; // BigDecimal -> string
}

export interface BidResponse {
    bidId: number;
    auctionId: number;
    bidderLabel: string;
    amount: string;
    placedAt: string; // ISO instant
}
