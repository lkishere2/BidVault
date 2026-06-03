import { useState } from 'react';
import RegisterBox from './RegisterBox';
import ErrorBox from '../../components/ErrorBox';

export default function RegisterPage() {
    const [error, setError] = useState<{ title: string; message: string } | null>(null);

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

            <div className="z-10 w-full flex items-center justify-center">
                <RegisterBox onError={(title, message) => setError({ title, message })} />
            </div>

            {error && (
                <ErrorBox
                    title={error.title}
                    message={error.message}
                    onClose={() => setError(null)}
                />
            )}
        </main>
    );
}