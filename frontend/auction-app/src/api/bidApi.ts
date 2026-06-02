import api from './axios';
import type { BidResponse, BidRequest } from '../types/bid';
import type { Page, Slice } from '../types/pagination';
import type { AuctionResponse } from '../types/auction';

export const bidApi = {
    getBidHistory: (auctionId: number, page: number = 0, size: number = 20) => api.get<Slice<BidResponse>>(`/auctions/bids/${auctionId}?page=${page}&size=${size}`),
    getAuctionsBidOn: (page: number = 0, size: number = 10) => api.get<Page<AuctionResponse>>(`/auctions/me/auctions-bid-on?page=${page}&size=${size}`),
    sendBidWebSocketPayload: (auctionId: number, body: BidRequest) => {
        return {
            destination: `/app/auction/${auctionId}/bid`,
            body: body
        };
    }
};
export default bidApi;