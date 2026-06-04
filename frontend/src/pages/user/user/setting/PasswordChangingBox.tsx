import { useState } from 'react';
import { userApi } from '../../../../api/userApi';
import { authApi } from '../../../../api/authApi';
import { SuccessNotification, FailedNotification } from './Notification';

interface PasswordChangingBoxProps {
    userEmail: string;
}

export const PasswordChangingBox = ({ userEmail }: PasswordChangingBoxProps) => {
    const [step, setStep] = useState<'idle' | 'requested'>('idle');
    const [verificationCode, setVerificationCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const handleRequestOTP = async () => {
        setLoading(true);
        try {
            await authApi.requestPasswordReset(userEmail);
            setStep('requested');
            setNotification({ type: 'success', message: 'Verification code sent to your email!' });
        } catch {
            setNotification({ type: 'error', message: 'Failed to send verification code. Try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await userApi.updatePassword({ verificationCode, newPassword });
            setNotification({ type: 'success', message: 'Password updated successfully!' });
            setVerificationCode('');
            setNewPassword('');
            setStep('idle');
        } catch {
            setNotification({ type: 'error', message: 'Failed to update password. Check your verification code.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between p-5 border border-neutral-200 rounded-xl bg-neutral-50 gap-4 transition-colors hover:bg-neutral-100/50">
                <div className="flex flex-col">
                    <h3 className="text-[15px] font-bold text-[#0D0D0D]">Password</h3>
                    <p className="text-[13px] font-medium text-neutral-500 max-w-[280px]">Ensure your account is using a long, random password to stay secure.</p>
                </div>
                <div className="flex flex-col gap-3 w-full sm:w-auto">
                    {step === 'idle' ? (
                        <button
                            type="button"
                            onClick={handleRequestOTP}
                            disabled={loading}
                            className="px-6 py-2.5 rounded-lg text-[13px] font-black text-[#0D0D0D] disabled:opacity-50 bg-neutral-200 hover:bg-neutral-300 transition-colors shadow-sm self-start sm:self-end mt-2"
                        >
                            {loading ? 'Sending...' : 'Request Verification Code'}
                        </button>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                            <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                placeholder="6-digit Verification Code"
                                maxLength={6}
                                className="w-full sm:w-72 border border-neutral-300 rounded-lg px-4 py-2 text-[14px] font-semibold text-[#0D0D0D] outline-none focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D] transition-all bg-white shadow-sm tracking-widest text-center"
                                required
                            />
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="New Password"
                                className="w-full sm:w-72 border border-neutral-300 rounded-lg px-4 py-2 text-[14px] font-semibold text-[#0D0D0D] outline-none focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D] transition-all bg-white shadow-sm"
                                required
                                minLength={6}
                                maxLength={15}
                            />
                            <button
                                type="submit"
                                disabled={loading || !verificationCode || !newPassword}
                                className="px-6 py-2.5 rounded-lg text-[13px] font-black text-[#0D0D0D] disabled:opacity-50 bg-[#F5C518] hover:bg-[#e0b416] transition-colors shadow-md self-end w-full sm:w-auto"
                            >
                                {loading ? 'Saving...' : 'Update Password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
            {notification?.type === 'success' && (
                <SuccessNotification message={notification.message} onClose={() => setNotification(null)} />
            )}
            {notification?.type === 'error' && (
                <FailedNotification message={notification.message} onClose={() => setNotification(null)} />
            )}
        </>
    );
};