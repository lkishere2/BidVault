import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { authApi } from '../../api/authApi';

interface LoginBoxProps {
    onError: (title: string, message: string, email?: string, isUnverified?: boolean) => void;
    onSuccess: () => void;
}

const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

export default function LoginBox({ onError, onSuccess }: LoginBoxProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleLogin = () => {
        let baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        baseUrl = baseUrl.replace(/\/api(\/v1)?\/?$/, '');
        window.location.href = `${baseUrl}/oauth2/authorization/google`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await authApi.login({ email, password });
            console.log('Authentication successful:', response.data);

            // Save tokens securely to the browser storage layer
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);

            // Bubble up to App.tsx which will fetch user data and navigate
            onSuccess();
        } catch (error: any) {
            // Read backend error message directly from your response body structure
            const errorMsg = error.response?.data?.message || 'Invalid email address or password.';

            // Check against your Spring Boot AccountNotVerifiedException signature
            const isUnverified = errorMsg.includes('not verified') || error.response?.status === 403;

            if (isUnverified) {
                onError('Account Unverified', errorMsg, email, true);
            } else {
                onError('Login Failed', errorMsg, undefined, false);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card
            className="w-full max-w-[448px] sm:h-[580px] sm:min-h-[580px] sm:max-h-[580px] min-h-[500px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] px-[16px] rounded-[16px] flex-shrink-0 flex flex-col justify-between overflow-hidden bg-white mx-4 sm:mx-0"
        >
            <CardHeader className="text-center space-y-[12px] pt-[40px] pb-[10px]">
                <CardTitle className="text-[30px] font-extrabold text-[#0D0D0D] tracking-tight">
                    BidVault
                </CardTitle>
                <CardDescription className="text-[16px] text-gray-500">
                    Sign in to access your secure account.
                </CardDescription>
            </CardHeader>
            <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center py-4 px-6 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] border mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <GoogleIcon /> Continue with Google
            </button>
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between pb-[35px]">
                <CardContent className="space-y-[20px] pt-[10px]">
                    <div className="space-y-[10px]">
                        <Label htmlFor="email" className="text-[#0D0D0D] font-semibold text-[14px]">
                            Email Address
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                            className="h-[48px] focus-visible:ring-[#F5C518] text-[16px]"
                        />
                    </div>

                    <div className="space-y-[10px]">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="password" className="text-[#0D0D0D] font-semibold text-[14px]">
                                Password
                            </Label>
                            <Link
                                to="/forget-password"
                                className="text-[13px] font-medium text-gray-500 hover:text-[#D4A900] transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            className="h-[48px] focus-visible:ring-[#F5C518] text-[16px]"
                        />
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-[20px] pt-[10px] bg-transparent border-t-0 shadow-none">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-[48px] rounded-full bg-[#F5C518] text-[#0D0D0D] text-[16px] font-bold hover:bg-[#D4A900] transition-colors shadow-md border-none"
                    >
                        {isLoading ? 'Logging In...' : 'Log In'}
                    </Button>

                    <p className="text-[14px] text-gray-500 text-center">
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            className="font-bold text-[#0D0D0D] hover:text-[#D4A900] transition-colors underline underline-offset-4"
                        >
                            Register
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    );
}