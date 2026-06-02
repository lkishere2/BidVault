import api from './axios';
import type { BidResponse, BidRequest } from '../types/bid';
import type { AuctionResponse } from '../types/auction';
import type { Page } from '../types/pagination';

export const bidApi = {
    getBidHistory: (auctionId: number) => api.get<BidResponse[]>(`/auctions/bids/${auctionId}`),
    getAuctionsBidOn: (page: number = 0, size: number = 10) => api.get<Page<AuctionResponse>>(`/auctions/me/auctions-bid-on?page=${page}&size=${size}`),
    sendBidWebSocketPayload: (auctionId: number, body: BidRequest) => {
        return {
            destination: `/app/auction/${auctionId}/bid`,
            body: body
        };
    }
};
export default bidApi;