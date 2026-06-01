import api from './axios';
import type { BidResponse, BidRequest } from '../types/bid';
import type { AuctionResponse } from '../types/auction';

export const bidApi = {
    getBidHistory: (auctionId: number) =>
        api.get<BidResponse[]>(`/api/v1/auctions/bids/${auctionId}`),

    getAuctionsBidOn: () =>
        api.get<AuctionResponse[]>('/api/v1/auctions/me/auctions-bid-on'),

    sendBidWebSocketPayload: (auctionId: number, body: BidRequest) => {
        return {
            destination: `/app/auction/${auctionId}/bid`, // Thường prefix config Spring Boot là /app
            body: body
        };
    }
};

export default bidApi;