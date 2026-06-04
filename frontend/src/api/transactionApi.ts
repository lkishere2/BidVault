import api from './axios';
import type { TransactionRequest, TransactionResponse, ClientRequest } from '../types/transaction';
import type { Page } from '../types/pagination';

export const transactionApi = {
    getUserTransactions: (page: number = 0, size: number = 20) => api.get<Page<TransactionResponse>>('/api/v1/transaction/me', { params: { page, size } }),
    createTransaction: (data: TransactionRequest) => api.post<TransactionResponse>('/api/v1/transaction/create', data),
    deleteTransaction: (id: number) => api.delete<void>(`/api/v1/transaction/delete/${id}`),
    getAllTransactionRequests: (page: number = 0, size: number = 20) => api.get<Page<ClientRequest>>('/api/v1/transaction/all', { params: { page, size } }),
    acceptTransaction: (data: ClientRequest) => api.post<void>('/api/v1/transaction/accept', data),
    cancelTransaction: (id: number) => api.put<void>(`/api/v1/transaction/cancel/${id}`),
};
export default transactionApi;