import api from './axios';
import type { ProductRequest, ProductResponse, PagedProducts, Tag } from '../types/product';

export const productApi = {
    getStorage: (options?: { page?: number; size?: number; keyword?: string; tags?: Tag[] | Set<Tag> }) => {
        const params: any = {
            page: options?.page ?? 0,
            size: options?.size ?? 10,
        } as any;

        if (options?.keyword) params.keyword = options.keyword;
        if (options?.tags) params.tags = Array.isArray(options.tags) ? options.tags : Array.from(options.tags);

        return api.get<PagedProducts>('/inventory/get', { params });
    },

    addProduct: (data: ProductRequest) => api.post<ProductResponse>('/inventory/add', data),

    editProduct: (id: number, data: ProductRequest) => api.put<ProductResponse>(`/inventory/update/${id}`, data),

    deleteProduct: (id: number) => api.delete<void>(`/inventory/delete/${id}`),
};

export default productApi;
