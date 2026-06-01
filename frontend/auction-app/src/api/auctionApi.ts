import api from './axios';
import type { AuctionRequest, AuctionResponse, AuctionFindingRequest } from '../types/auction';
import type { Page } from '../types/pagination';

export const auctionApi = {

    // 1. Tạo cuộc đấu giá mới
    createAuction: (data: AuctionRequest) =>
        api.post<AuctionResponse>('/api/v1/auctions/create', data),

    // 2. Hủy cuộc đấu giá
    cancelAuction: (auctionId: number) =>
        api.delete<AuctionResponse>(`/api/v1/auctions/cancel/${auctionId}`),

    // 3. Lấy chi tiết một cuộc đấu giá
    getAuction: (auctionId: number) =>
        api.get<AuctionResponse>(`/api/v1/auctions/get/${auctionId}`),

    // 4. Tìm kiếm / Khám phá các cuộc đấu giá (Sửa đổi: Chuyển sang params)
    getDiscoverableAuctions: (data: AuctionFindingRequest, page: number = 0, size: number = 10) =>
        api.get<Page<AuctionResponse>>('/api/v1/auctions/discover', {
            params: {
                ...data,
                page,
                size
            }
        }),

    // 5. Lấy danh sách đấu giá của tôi (Sửa đổi: Đổi từ Array sang Page và thêm phân trang)
    getMyAuctions: (pageNo: number = 0, size: number = 10) =>
        api.get<Page<AuctionResponse>>('/api/v1/auctions/me', {
            params: {
                pageNo,
                size
            }
        }),

};

export default auctionApi;