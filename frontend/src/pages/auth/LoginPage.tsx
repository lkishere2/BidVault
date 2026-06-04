import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginBox from './LoginBox';
import ErrorBox from '../../components/ErrorBox';
import { authApi } from '../../api/authApi';

interface LoginPageProps {
    onLoginSuccess: () => Promise<void> | void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
    const [alert, setAlert] = useState<{ title: string; message: string; email?: string; isUnverified: boolean } | null>(null);
    const navigate = useNavigate();

    const handleLoginError = (title: string, message: string, email?: string, isUnverified = false) => {
        setAlert({ title, message, email, isUnverified });
    };

    const handleResendVerification = async () => {
        if (!alert?.email) return;
        try {
            await authApi.resendVerificationCode(alert.email);
            setAlert(null);
            navigate('/verify/user', { state: { email: alert.email } });
        } catch (error) {
            console.error('Failed to automatically trigger verification re-send drop:', error);
        }
    };

    // Xử lý khi đăng nhập thành công
    const handleLoginSuccessInternal = async () => {
        // Gọi callback truyền ngược lên App.tsx để lưu thông tin user / token vào state tổng
        await onLoginSuccess();

        // Chuyển hướng người dùng sang trang Dashboard ở đường dẫn /office
        navigate('/');
    };

    return (
        <main className="w-screen h-screen min-h-screen flex items-center justify-center bg-gray-50 overflow-hidden select-none relative">
            {/* Watermark Background */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0">
                <div 
                    className="text-[25vw] font-black opacity-10 select-none -rotate-6 whitespace-nowrap tracking-tighter"
                    style={{ WebkitTextStroke: '6px #F5C518', color: 'transparent' }}
                >
                    BIDVAULT
                </div>
            </div>

            {/* Content */}
            <div className="z-10 w-full flex items-center justify-center">
                <LoginBox onError={handleLoginError} onSuccess={handleLoginSuccessInternal} />
            </div>

            {alert && (
                <ErrorBox
                    title={alert.title}
                    message={alert.message}
                    countdownSeconds={alert.isUnverified ? 120 : undefined}
                    actionButtonText={alert.isUnverified ? "Resend Verification Link" : undefined}
                    onClose={() => setAlert(null)}
                    onActionClick={alert.isUnverified ? handleResendVerification : undefined}
                />
            )}
        </main>
    );
}