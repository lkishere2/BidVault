import { useState, useEffect, useCallback } from 'react';
import UserCard from './UserCard';
import UserTransactionHistory from './UserTransactionHistory';
import RequestBox from './RequestBox';
import BalancePageLoading from './BalancePageLoading';
import { userApi } from '../../../../api/userApi';
import { transactionApi } from '../../../../api/transactionApi';
import type { TransactionResponse, TransactionType } from '../../../../types/transaction';

export default function BalancePage() {
    const [balance, setBalance] = useState<string | null>(null);
    const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [modalType, setModalType] = useState<TransactionType | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchWalletData = useCallback(async () => {
        try {
            setError(null);
            const [balanceRes, historyRes] = await Promise.all([
                userApi.getInfo(),
                transactionApi.getUserTransactions(0, 20)
            ]);

            setBalance(balanceRes.data?.balance ?? '0');
            setTransactions(historyRes.data?.content || []);
        } catch (err) {
            console.error(err);
            setError("Unable to load balance data.");
        } finally {
            setInitialLoading(false);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            if (isMounted) {
                await fetchWalletData();
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, [fetchWalletData]);

    if (initialLoading) {
        return <BalancePageLoading />;
    }

    return (
        <div className="flex flex-col gap-8 w-full bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div>
                <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Payments & Wallet</h1>
                <p className="text-neutral-400 text-xs mt-0.5">
                    Monitor your digital wallet holdings and request fund deposit approvals.
                </p>
            </div>

            {error ? (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
                    {error}
                </div>
            ) : (
                <>
                    <UserCard
                        balance={balance}
                        onAction={(type) => setModalType(type)}
                    />

                    <hr className="border-neutral-100" />

                    <UserTransactionHistory
                        transactions={transactions}
                    />
                </>
            )}

            {modalType && (
                <RequestBox
                    type={modalType}
                    onClose={() => setModalType(null)}
                    onSuccess={fetchWalletData}
                />
            )}
        </div>
    );
}