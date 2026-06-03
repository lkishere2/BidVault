import { Wallet, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface UserCardProps {
    balance: string | null;
    onAction: (type: 'DEPOSIT' | 'WITHDRAWAL') => void;
}

export default function UserCard({ balance, onAction }: UserCardProps) {
    return (
        <div className="w-full bg-[#0D0D0D] rounded-2xl p-6 sm:p-8 shadow-md border border-neutral-800 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 opacity-[0.03] text-white pointer-events-none">
                <Wallet size={160} />
            </div>

            <div className="flex items-center gap-4 z-10">
                <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center border border-neutral-700">
                    <Wallet size={24} className="text-[#F5C518]" />
                </div>
                <div>
                    <p className="text-[11px] font-bold tracking-wider uppercase text-neutral-400">Available Balance</p>
                    <h2 className="text-[28px] sm:text-[34px] font-black tracking-tight mt-0.5 text-[#F5C518]">
                        {balance !== null ? `$${Number(balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00'}
                    </h2>
                </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto z-10">
                <button
                    onClick={() => onAction('DEPOSIT')}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 h-11 px-6 bg-[#F5C518] text-[#0D0D0D] font-bold text-[13px] rounded-xl hover:bg-[#e0b416] transition-colors shadow-lg"
                >
                    <ArrowDownLeft size={16} strokeWidth={2.5} />
                    Deposit
                </button>
                <button
                    onClick={() => onAction('WITHDRAWAL')}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 h-11 px-6 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-[13px] rounded-xl transition-all border border-neutral-700"
                >
                    <ArrowUpRight size={16} strokeWidth={2.5} />
                    Withdraw
                </button>
            </div>
        </div>
    );
}