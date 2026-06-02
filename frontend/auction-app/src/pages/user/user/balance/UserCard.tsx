import { Wallet, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface UserCardProps {
    balance: string | null;
    onAction: (type: 'DEPOSIT' | 'WITHDRAWAL') => void;
}

export default function UserCard({ balance, onAction }: UserCardProps) {
    return (
        <div className="w-full bg-gradient-to-tr from-[#9A741A] via-[#FCE484] via-[#FFF9D4] via-[#E6BA43] to-[#A37B1F] rounded-2xl p-6 shadow-[0_10px_30px_rgba(218,165,32,0.25)] border border-[#FFF5C0]/40 text-neutral-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0)_30%,rgba(255,255,255,0.4)_45%,rgba(255,255,255,0.4)_55%,rgba(255,255,255,0)_70%)] bg-[length:200%_100%] animate-[shimmer_6s_infinite] pointer-events-none" />

            <div className="absolute -right-6 -bottom-6 opacity-[0.07] text-neutral-950 pointer-events-none">
                <Wallet size={140} />
            </div>

            <div className="flex items-center gap-4 z-10">
                <div className="w-12 h-12 rounded-xl bg-neutral-950/10 flex items-center justify-center backdrop-blur-md border border-white/20">
                    <Wallet size={24} className="text-neutral-900" />
                </div>
                <div>
                    <p className="text-[11px] font-bold tracking-wider uppercase opacity-75">Available Balance</p>
                    <h2 className="text-3xl font-black tracking-tight mt-0.5 drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
                        {balance !== null ? `$${Number(balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00'}
                    </h2>
                </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto z-10">
                <button
                    onClick={() => onAction('DEPOSIT')}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 h-11 px-5 bg-neutral-900 text-[#FCE484] font-bold text-xs rounded-xl hover:bg-neutral-800 transition-colors shadow-lg shadow-black/20 border border-neutral-950"
                >
                    <ArrowDownLeft size={15} strokeWidth={2.5} />
                    Deposit
                </button>
                <button
                    onClick={() => onAction('WITHDRAWAL')}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 h-11 px-5 bg-neutral-950/10 hover:bg-neutral-950/20 text-neutral-900 font-bold text-xs rounded-xl transition-all border border-neutral-950/15 backdrop-blur-sm"
                >
                    <ArrowUpRight size={15} strokeWidth={2.5} />
                    Withdraw
                </button>
            </div>
        </div>
    );
}