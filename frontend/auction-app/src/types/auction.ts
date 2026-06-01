import type { Tag } from './product';

export type AuctionStatus = 'UPCOMING' | 'ACTIVE' | 'ENDED' | 'CANCELLED';

export interface AuctionRequest {
    productId: number;
    quantity: number;
    startingPrice: number; // Đổi thành number để khớp với BigDecimal, hoặc string nếu bạn quản lý chuỗi lớn
    startTime: string;     // ISO String (Instant bên Java)
    endTime: string;       // ISO String (Instant bên Java)
}

export interface AuctionResponse {
    id: number;
    sellerId: number;
    sellerLabel: string;
    productId: number;
    productName: string;
    productTags: Tag[];
    productDescription?: string;
    productImageUrl?: string;
    auctionedQuantity: number;
    startingPrice: string;
    currentPrice: string;
    minBidIncrement: string;
    startTime: string;
    endTime: string;
    extended: boolean;
    status: AuctionStatus;
    winnerId: number | null;
    winnerLabel: string | null;
    bidCount: string;
}

export interface AuctionFindingRequest {
    productName?: string;
    tags?: Tag[]; // Khớp với Set<Tag> bên backend (truyền object hoặc xử lý mảng)
    startTime?: string;
    endTime?: string;
    minStartingPrice?: string;
    status?: AuctionStatus;
}