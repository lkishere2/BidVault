import { useState } from 'react';
import { Check, X, Loader2, ArrowUpRight, ArrowDownLeft, User, Mail } from 'lucide-react';
import { transactionApi } from '../../../api/transactionApi';
import type { ClientRequest } from '../../../types/transaction';

interface RequestItemProps {
    request: ClientRequest; // Cleaned up type mapping since status is now baked into ClientRequest
    onRefresh: () => Promise<void>;
}

export default function RequestItem({ request, onRefresh }: RequestItemProps) {
    const [actionLoading, setActionLoading] = useState<'ACCEPT' | 'DENY' | null>(null);
    const [localStatus, setLocalStatus] = useState<string | null>(null);

    const isDeposit = request.type === 'DEPOSIT'; //

    const handleAccept = async () => {
        setActionLoading('ACCEPT'); //
        try {
            await transactionApi.acceptTransaction(request); //
            setLocalStatus('SUCCESS'); //
            await onRefresh(); //
        } catch (err) {
            console.error(err); //
        } finally {
            setActionLoading(null); //
        }
    };

    const handleDeny = async () => {
        setActionLoading('DENY'); //
        try {
            await transactionApi.cancelTransaction(request.transactionId); //
            setLocalStatus('FAILED'); //
            await onRefresh(); //
        } catch (err) {
            console.error(err); //
        } finally {
            setActionLoading(null); //
        }
    };

    // Resolves status reactively if local UI state changes before parent re-fetches
    const currentStatus = localStatus || request.status || 'PENDING'; //

    const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(request.amount); //

    const formattedDate = new Date(request.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }); //

    return (
        <div className="border border-neutral-100 rounded-xl p-4 bg-white hover:bg-neutral-50/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isDeposit ? 'bg-blue-50 text-blue-600' : 'bg-neutral-800 text-neutral-100'
                    }`}>
                    {isDeposit ? <ArrowDownLeft size={16} strokeWidth={2.5} /> : <ArrowUpRight size={16} strokeWidth={2.5} />}
                </div>

                <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className={`text-[15px] font-bold ${isDeposit ? 'text-blue-600' : 'text-neutral-900'}`}>
                            {isDeposit ? '+' : '-'}{formattedAmount}
                        </span>
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${isDeposit ? 'bg-blue-50 text-blue-700' : 'bg-neutral-100 text-neutral-700'
                            }`}>
                            {request.type}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
                        <div className="flex items-center gap-1 min-w-0">
                            <User size={13} className="text-neutral-400 flex-shrink-0" />
                            <span className="font-semibold text-neutral-700 truncate">{request.username}</span>
                        </div>
                        <div className="flex items-center gap-1 min-w-0">
                            <Mail size={13} className="text-neutral-400 flex-shrink-0" />
                            <span className="truncate">{request.email}</span>
                        </div>
                    </div>

                    <p className="text-[11px] text-neutral-400">{formattedDate}</p>
                </div>
            </div>

            {/* Condition: If PENDING show action buttons, otherwise display historical status */}
            <div className="flex items-center justify-end gap-2 flex-shrink-0 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-neutral-50">
                {currentStatus === 'PENDING' ? (
                    <>
                        <button
                            type="button"
                            onClick={handleDeny}
                            disabled={actionLoading !== null}
                            className="flex-1 sm:flex-none h-9 px-4 border border-neutral-200 text-neutral-600 font-semibold rounded-lg text-xs hover:bg-neutral-50 transition-colors inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                            {actionLoading === 'DENY' ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <X size={14} />
                            )}
                            Deny
                        </button>
                        <button
                            type="button"
                            onClick={handleAccept}
                            disabled={actionLoading !== null}
                            className="flex-1 sm:flex-none h-9 px-4 bg-neutral-900 text-white font-semibold rounded-lg text-xs hover:bg-neutral-800 transition-colors inline-flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                        >
                            {actionLoading === 'ACCEPT' ? (
                                <Loader2 size={14} className="animate-spin text-white" />
                            ) : (
                                <Check size={14} />
                            )}
                            Approve
                        </button>
                    </>
                ) : (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${currentStatus === 'SUCCESS'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-rose-50 text-rose-700 border-rose-100'
                        }`}>
                        {currentStatus === 'SUCCESS' ? 'Approved' : 'Rejected'}
                    </span>
                )}
            </div>
        </div>
    );
}