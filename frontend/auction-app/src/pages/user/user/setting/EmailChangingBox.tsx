import { useState } from 'react';
import { userApi } from '../../../../api/userApi';
import { SuccessNotification, FailedNotification } from './Notification';

export const EmailChangingBox = ({ currentEmail }: { currentEmail: string }) => {
    const [email, setEmail] = useState(currentEmail);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await userApi.updateEmail({ email });
            setNotification({ type: 'success', message: 'Email updated successfully!' });
        } catch {
            setNotification({ type: 'error', message: 'Failed to update email. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-neutral-200 rounded-xl bg-neutral-50 gap-4 transition-colors hover:bg-neutral-100/50">
                <div className="flex flex-col">
                    <h3 className="text-[15px] font-bold text-[#0D0D0D]">Email Address</h3>
                    <p className="text-[13px] font-medium text-neutral-500">Used for login and important notifications.</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 sm:w-64 border border-neutral-300 rounded-lg px-4 py-2 text-[14px] font-semibold text-[#0D0D0D] outline-none focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D] transition-all bg-white shadow-sm"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 rounded-lg text-[13px] font-bold text-white disabled:opacity-50 bg-[#0D0D0D] hover:bg-neutral-800 transition-colors shadow-md whitespace-nowrap"
                    >
                        {loading ? 'Saving...' : 'Update'}
                    </button>
                </div>
            </form>
            {notification?.type === 'success' && (
                <SuccessNotification message={notification.message} onClose={() => setNotification(null)} />
            )}
            {notification?.type === 'error' && (
                <FailedNotification message={notification.message} onClose={() => setNotification(null)} />
            )}
        </>
    );
};