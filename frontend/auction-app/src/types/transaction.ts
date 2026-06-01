export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL';
export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface TransactionRequest {
    amount: string; // Đồng bộ với BigDecimal bên Backend
    type: TransactionType;
}

export interface TransactionResponse {
    amount: string;
    type: TransactionType;
    status: TransactionStatus;
    createdAt: string; // Khớp với LocalDateTime (ISO String)
}

export interface ClientRequest {
    transactionId: number; // Khớp với Long transactionId bên Backend
    userId: number;
    username: string;
    email: string;
    amount: number;
    type: TransactionType;
    createdAt: string;
}