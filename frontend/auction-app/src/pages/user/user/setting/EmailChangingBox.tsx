import { useState } from 'react';
import { userApi } from '../../../../api/userApi';
import { theme } from '../../../../components/constants/theme';

export const EmailChangingBox = ({ currentEmail }: { currentEmail: string }) => {
    const [email, setEmail] = useState(currentEmail);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await userApi.updateEmail({ email });
            alert('Email updated successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to update email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border border-[#E8E8E8] rounded-lg mb-4 bg-white">
            <h3 className="font-semibold mb-2" style={{ color: theme.black }}>Change Email</h3>
            <div className="flex gap-2">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 border border-neutral-200 rounded px-3 py-2 outline-none focus:border-[#F5C518]"
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded text-white disabled:opacity-50"
                    style={{ backgroundColor: theme.black }}
                >
                    {loading ? 'Saving...' : 'Update'}
                </button>
            </div>
        </form>
    );
};