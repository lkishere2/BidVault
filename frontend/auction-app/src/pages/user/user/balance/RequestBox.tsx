import { useState, type FormEvent } from 'react';
import { X, Loader2, DollarSign } from 'lucide-react';
import { transactionApi } from '../../../../api/transactionApi';
import type { TransactionType } from '../../../../types/transaction';

interface RequestBoxProps {
    type: TransactionType;
    onClose: () => void;
    onSuccess: () => void;
}

interface AxiosErrorResponse {
    response?: {
        data?: {
            message?: string;
        };
    };
}

export default function RequestBox({ type, onClose, onSuccess }: RequestBoxProps) {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!amount || Number(amount) <= 0) {
            setError('Please enter a valid amount greater than 0.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await transactionApi.createTransaction({
                amount: amount,
                type: type,
            });
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            const serverError = err as AxiosErrorResponse;
            setError(serverError.response?.data?.message || 'Failed to submit transaction request.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={!loading ? onClose : undefined} />

            <div className="relative w-full max-w-md bg-white border border-neutral-200 rounded-2xl p-6 shadow-xl z-10 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-neutral-900">
                        {type === 'DEPOSIT' ? 'Deposit Funds Request' : 'Withdraw Funds Request'}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="text-neutral-400 hover:text-neutral-600 disabled:opacity-50 p-1 rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="amount" className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                            Amount ($)
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                                <DollarSign size={16} />
                            </span>
                            <input
                                id="amount"
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                disabled={loading}
                                className="w-full h-11 pl-10 pr-4 bg-neutral-50 border border-neutral-200 rounded-xl font-medium text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                                autoFocus
                            />
                        </div>
                        <p className="text-xs text-neutral-400 mt-2">
                            {type === 'DEPOSIT'
                                ? 'Submit a deposit notice. Administrators will review and update your balance.'
                                : 'Ensure you have sufficient balance before submitting a withdrawal request.'
                            }
                        </p>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 h-11 border border-neutral-200 text-neutral-600 font-semibold rounded-xl text-[14px] hover:bg-neutral-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-1 h-11 text-white font-semibold rounded-xl text-[14px] flex items-center justify-center gap-2 shadow-sm transition-all ${type === 'DEPOSIT'
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-neutral-900 hover:bg-neutral-800'
                                } disabled:opacity-50`}
                        >
                            {loading ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : type === 'DEPOSIT' ? (
                                'Submit Deposit'
                            ) : (
                                'Submit Withdrawal'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}