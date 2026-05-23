import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginBox from './LoginBox';
import ErrorBox from '../../components/ErrorBox';
import { authApi } from '../../api/authApi';

interface LoginPageProps {
    onLoginSuccess: (user: { username: string; initials: string }) => void;
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
            // Redirect smoothly into user verification path with email context
            navigate('/verify/user', { state: { email: alert.email } });
        } catch (error) {
            console.error('Failed to automatically trigger verification re-send drop:', error);
        }
    };

    // Bubble up to App.tsx which owns both state + navigation
    const handleLoginSuccessInternal = (userData: { username: string; initials: string }) => {
        onLoginSuccess(userData);
    };

    return (
        <main className="w-screen h-screen min-h-screen flex items-center justify-center bg-gray-50 overflow-hidden select-none relative">
            {/* Make sure your LoginBox component accepts an onSuccess prop to pass back the user profile */}
            <LoginBox onError={handleLoginError} onSuccess={handleLoginSuccessInternal} />

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