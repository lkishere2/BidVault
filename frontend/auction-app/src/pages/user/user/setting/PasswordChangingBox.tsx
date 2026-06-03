import { useState } from 'react';
import { userApi } from '../../../../api/userApi';
import { SuccessNotification, FailedNotification } from './Notification';

export const PasswordChangingBox = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await userApi.updatePassword({ currentPassword, newPassword });
            setNotification({ type: 'success', message: 'Password updated successfully!' });
            setCurrentPassword('');
            setNewPassword('');
        } catch {
            setNotification({ type: 'error', message: 'Failed to update password. Check your current password and try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row justify-between p-5 border border-neutral-200 rounded-xl bg-neutral-50 gap-4 transition-colors hover:bg-neutral-100/50">
                <div className="flex flex-col">
                    <h3 className="text-[15px] font-bold text-[#0D0D0D]">Password</h3>
                    <p className="text-[13px] font-medium text-neutral-500 max-w-[280px]">Ensure your account is using a long, random password to stay secure.</p>
                </div>
                <div className="flex flex-col gap-3 w-full sm:w-auto">
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Current Password"
                        className="w-full sm:w-72 border border-neutral-300 rounded-lg px-4 py-2 text-[14px] font-semibold text-[#0D0D0D] outline-none focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D] transition-all bg-white shadow-sm"
                        required
                    />
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New Password"
                        className="w-full sm:w-72 border border-neutral-300 rounded-lg px-4 py-2 text-[14px] font-semibold text-[#0D0D0D] outline-none focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D] transition-all bg-white shadow-sm"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 rounded-lg text-[13px] font-black text-[#0D0D0D] disabled:opacity-50 bg-[#F5C518] hover:bg-[#e0b416] transition-colors shadow-md self-end"
                    >
                        {loading ? 'Saving...' : 'Update Password'}
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