import api from './axios';
import type { Page } from '../types/pagination';
import type { ProductRequest, ProductResponse } from '../types/product';

export const productApi = {
    getStorage: (page: number = 0, size: number = 20) => api.get<Page<ProductResponse>>('/inventory/get', { params: { page, size } }),
    addProduct: (data: ProductRequest) => api.post<ProductResponse>('/inventory/add', data),
    editProduct: (id: number, data: ProductRequest) => api.put<ProductResponse>(`/inventory/update/${id}`, data),
    deleteProduct: (id: number) => api.delete<void>(`/inventory/delete/${id}`),
};
export default productApi;