import HistoryItem from './HistoryItem';
import type { TransactionResponse } from '../../../../types/transaction';

interface UserTransactionHistoryProps {
    transactions: TransactionResponse[];
}

export default function UserTransactionHistory({ transactions }: UserTransactionHistoryProps) {
    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-base font-bold text-neutral-900 tracking-tight">Transaction History</h3>
                <p className="text-xs text-neutral-400 mt-0.5">View your global account balance ledgers and requests timeline status.</p>
            </div>

            {transactions.length === 0 ? (
                <div className="border border-dashed border-neutral-200 rounded-xl p-8 text-center bg-neutral-50/30">
                    <p className="text-sm font-medium text-neutral-400">No transaction records found.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-2.5">
                    {transactions.map((tx, idx) => (
                        <HistoryItem key={idx} item={tx} />
                    ))}
                </div>
            )}
        </div>
    );
}