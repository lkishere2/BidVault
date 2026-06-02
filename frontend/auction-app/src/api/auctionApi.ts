import api from './axios';
import type { AuctionRequest, AuctionResponse, AuctionFindingRequest } from '../types/auction';
import type { Page } from '../types/pagination';

export const auctionApi = {
    createAuction: (data: AuctionRequest) => api.post<AuctionResponse>('/auctions/create', data),
    cancelAuction: (auctionId: number) => api.delete<AuctionResponse>(`/auctions/cancel/${auctionId}`),
    getAuction: (auctionId: number) => api.get<AuctionResponse>(`/auctions/get/${auctionId}`),
    getDiscoverableAuctions: (data: AuctionFindingRequest, page: number, size: number) =>
        api.get<Page<AuctionResponse>>('/auctions/discover', {
            params: { ...data, page, size },
            paramsSerializer: (params) => {
                const searchParams = new URLSearchParams();
                Object.keys(params).forEach(key => {
                    const value = params[key];
                    if (value !== undefined && value !== null) {
                        if (Array.isArray(value)) value.forEach(val => searchParams.append(key, val));
                        else searchParams.append(key, value);
                    }
                });
                return searchParams.toString();
            }
        }),
    getMyAuctions: (pageNo: number = 0, size: number = 10) => api.get<Page<AuctionResponse>>(`/auctions/me?pageNo=${pageNo}&size=${size}`),
    getTopAuctions: () => api.get<AuctionResponse[]>('/auctions/top'),
};
export default auctionApi;