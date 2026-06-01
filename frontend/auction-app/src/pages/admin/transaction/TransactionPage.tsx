import { useState, useEffect, useCallback } from 'react';
import RequestHistory from './RequestHistory';
import TransactionPageLoading from './TransactionPageLoading';
import { transactionApi } from '../../../api/transactionApi';
import type { ClientRequest } from '../../../types/transaction';

interface PaginatedResponse {
    content?: ClientRequest[];
    items?: ClientRequest[];
}

export default function TransactionPage() {
    const [requests, setRequests] = useState<ClientRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = useCallback(async () => {
        try {
            const res = await transactionApi.getAllTransactionRequests(0, 50);
            const data = res.data;
            if (Array.isArray(data)) {
                setRequests(data);
            } else if (data && typeof data === 'object') {
                const paginated = data as PaginatedResponse;
                setRequests(paginated.content || paginated.items || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchRequests();
        }, 0);
        return () => clearTimeout(timer);
    }, [fetchRequests]);

    if (loading) {
        return <TransactionPageLoading />;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Transaction Requests</h1>
                <p className="text-neutral-400 text-xs mt-0.5">
                    Review, approve, or reject incoming deposit and withdrawal requests from users.
                </p>
            </div>

            <RequestHistory requests={requests} onRefresh={fetchRequests} />
        </div>
    );
}