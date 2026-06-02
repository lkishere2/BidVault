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
            <form onSubmit={handleSubmit} className="p-4 border border-[#E8E8E8] rounded-lg bg-white">
                <h3 className="font-semibold mb-2 text-[#0D0D0D]">Change Password</h3>
                <div className="flex flex-col gap-3">
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Current Password"
                        className="w-full border border-neutral-200 rounded px-3 py-2 outline-none focus:border-[#F5C518] text-[#0D0D0D]"
                        required
                    />
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New Password"
                        className="w-full border border-neutral-200 rounded px-3 py-2 outline-none focus:border-[#F5C518] text-[#0D0D0D]"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 rounded self-start text-white disabled:opacity-50 bg-[#0D0D0D] hover:opacity-85 transition-opacity"
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