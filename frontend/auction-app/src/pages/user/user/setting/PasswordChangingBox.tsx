import { useState } from 'react';
import { userApi } from '../../../../api/userApi';
import { theme } from '../../../../components/constants/theme';

export const PasswordChangingBox = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await userApi.updatePassword({ currentPassword, newPassword });
            alert('Password updated successfully!');
            setCurrentPassword('');
            setNewPassword('');
        } catch (error) {
            console.error(error);
            alert('Failed to update password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border border-[#E8E8E8] rounded-lg bg-white">
            <h3 className="font-semibold mb-2" style={{ color: theme.black }}>Change Password</h3>
            <div className="flex flex-col gap-3">
                <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Current Password"
                    className="w-full border border-neutral-200 rounded px-3 py-2 outline-none focus:border-[#F5C518]"
                    required
                />
                <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New Password"
                    className="w-full border border-neutral-200 rounded px-3 py-2 outline-none focus:border-[#F5C518]"
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded self-start text-white disabled:opacity-50"
                    style={{ backgroundColor: theme.black }}
                >
                    {loading ? 'Saving...' : 'Update Password'}
                </button>
            </div>
        </form>
    );
};