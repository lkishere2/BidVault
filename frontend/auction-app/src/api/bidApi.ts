import api from './axios';
import type { BidResponse, BidRequest } from '../types/bid';
import type { AuctionResponse } from '../types/auction';

export const bidApi = {
    getBidHistory: (auctionId: number) => api.get<BidResponse[]>(`/auctions/bids/${auctionId}`),
    getAuctionsBidOn: () => api.get<AuctionResponse[]>('/auctions/me/auctions-bid-on'),
    sendBidWebSocketPayload: (auctionId: number, body: BidRequest) => {
        return {
            destination: `/app/auction/${auctionId}/bid`,
            body: body
        };
    }
};
export default bidApi;