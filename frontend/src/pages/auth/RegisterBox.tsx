import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { authApi } from '../../api/authApi';

interface RegisterBoxProps {
    onError: (title: string, message: string) => void;
}

export default function RegisterBox({ onError }: RegisterBoxProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            onError('Registration Error', 'Passwords do not match.');
            return;
        }

        setIsLoading(true);
        // Navigate immediately without waiting for the backend response
        authApi.register({ username: name, email, password }).catch((error: any) => {
             console.error('Registration failed in background:', error);
        });
        navigate('/verify/user', { state: { email } });
    };

    return (
        <Card
            className="border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] px-[16px] rounded-[16px] flex-shrink-0 flex flex-col justify-between overflow-hidden bg-white"
            style={{
                width: '448px',
                minWidth: '448px',
                maxWidth: '448px',
                height: '640px',
                minHeight: '640px',
                maxHeight: '640px'
            }}
        >
            <CardHeader className="text-center space-y-[6px] pt-[30px] pb-[5px]">
                <CardTitle className="text-[30px] font-extrabold text-[#0D0D0D] tracking-tight">
                    Create Account
                </CardTitle>
                <CardDescription className="text-[15px] text-gray-500">
                    Join BidVault to start secure bidding.
                </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between pb-[30px]">
                <CardContent className="space-y-[14px] pt-[10px]">
                    <div className="space-y-[6px]">
                        <Label htmlFor="name" className="text-[#0D0D0D] font-semibold text-[13px]">
                            Full Name
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            disabled={isLoading}
                            className="h-[42px] focus-visible:ring-[#F5C518] text-[15px]"
                        />
                    </div>

                    <div className="space-y-[6px]">
                        <Label htmlFor="email" className="text-[#0D0D0D] font-semibold text-[13px]">
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
                            className="h-[42px] focus-visible:ring-[#F5C518] text-[15px]"
                        />
                    </div>

                    <div className="space-y-[6px]">
                        <Label htmlFor="password" className="text-[#0D0D0D] font-semibold text-[13px]">
                            Password
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            className="h-[42px] focus-visible:ring-[#F5C518] text-[15px]"
                        />
                    </div>

                    <div className="space-y-[6px]">
                        <Label htmlFor="confirmPassword" className="text-[#0D0D0D] font-semibold text-[13px]">
                            Confirm Password
                        </Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            className="h-[42px] focus-visible:ring-[#F5C518] text-[15px]"
                        />
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-[16px] pt-[10px] bg-transparent border-t-0 shadow-none">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-[48px] rounded-full bg-[#F5C518] text-[#0D0D0D] text-[16px] font-bold hover:bg-[#D4A900] transition-colors shadow-md border-none"
                    >
                        {isLoading ? 'Signing Up...' : 'Sign Up'}
                    </Button>

                    <p className="text-[14px] text-gray-500 text-center">
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            className="font-bold text-[#0D0D0D] hover:text-[#D4A900] transition-colors underline underline-offset-4"
                        >
                            Log In
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    );
}