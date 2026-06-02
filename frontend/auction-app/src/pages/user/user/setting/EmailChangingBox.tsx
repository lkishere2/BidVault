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
            <form onSubmit={handleSubmit} className="p-4 border border-[#E8E8E8] rounded-lg mb-4 bg-white">
                <h3 className="font-semibold mb-2 text-[#0D0D0D]">Change Email</h3>
                <div className="flex gap-2">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 border border-neutral-200 rounded px-3 py-2 outline-none focus:border-[#F5C518] text-[#0D0D0D]"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 rounded text-white disabled:opacity-50 bg-[#0D0D0D] hover:opacity-85 transition-opacity"
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