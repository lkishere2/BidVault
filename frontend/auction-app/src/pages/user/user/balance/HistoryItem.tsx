import { PlusCircle, MinusCircle, Clock, CheckCircle2, XCircle } from 'lucide-react';
import type { TransactionResponse, TransactionStatus } from '../../../../types/transaction';

interface HistoryItemProps {
    item: TransactionResponse;
}

interface StatusStyle {
    bg: string;
    icon: React.ReactNode;
    label: string;
}

export default function HistoryItem({ item }: HistoryItemProps) {
    const isDeposit = item.type === 'DEPOSIT';

    const statusConfig: Record<TransactionStatus, StatusStyle> = {
        PENDING: {
            bg: 'bg-amber-50 text-amber-700 border-amber-100',
            icon: <Clock size={13} className="text-amber-500" />,
            label: 'Pending'
        },
        SUCCESS: {
            bg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
            icon: <CheckCircle2 size={13} className="text-emerald-500" />,
            label: 'Success'
        },
        FAILED: {
            bg: 'bg-rose-50 text-rose-700 border-rose-100',
            icon: <XCircle size={13} className="text-rose-500" />,
            label: 'Failed'
        }
    };

    const currentStatus = statusConfig[item.status] || statusConfig.PENDING;

    const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(Number(item.amount));

    const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className="flex items-center justify-between p-4 border border-neutral-100 rounded-xl hover:bg-neutral-50/50 transition-colors gap-4">
            <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${isDeposit ? 'bg-blue-50 text-blue-600' : 'bg-neutral-100 text-neutral-600'
                    }`}>
                    {isDeposit ? <PlusCircle size={18} /> : <MinusCircle size={18} />}
                </div>
                <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-neutral-800 truncate">
                        {isDeposit ? 'Deposit Funds' : 'Withdraw Funds'}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                        {formattedDate}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right">
                    <p className={`text-[15px] font-black tracking-tight ${isDeposit ? 'text-[#0D0D0D]' : 'text-neutral-500'}`}>
                        {isDeposit ? '+' : '-'}{formattedAmount}
                    </p>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${currentStatus.bg}`}>
                    {currentStatus.icon}
                    {currentStatus.label}
                </span>
            </div>
        </div>
    );
}