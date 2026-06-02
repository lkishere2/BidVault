// NotFoundPage.tsx
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <main className="w-screen h-screen flex items-center justify-center bg-gray-50 select-none">
            <div
                className="border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[16px] bg-white text-center"
                style={{ width: 448, padding: '48px 40px 40px' }}
            >
                <h1 className="text-[24px] font-extrabold text-[#0D0D0D] tracking-tight mb-8">BidVault</h1>

                {/* gavel icon — swap for any lucide icon you prefer */}
                <div className="text-[#F5C518] text-5xl mb-3">⚖️</div>

                <p className="text-[72px] font-extrabold text-[#F5C518] leading-none tracking-tighter">404</p>
                <p className="text-[20px] font-bold text-[#0D0D0D] mt-1 mb-2">Page not found</p>
                <p className="text-[15px] text-gray-500 mb-8 leading-relaxed">
                    The page you're looking for has been moved,<br />deleted, or never existed.
                </p>

                <button
                    onClick={() => navigate('/')}
                    className="w-full h-[48px] rounded-full bg-[#F5C518] text-[#0D0D0D] text-[16px] font-bold hover:bg-[#D4A900] transition-colors"
                >
                    Back to Home
                </button>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 text-[14px] text-gray-500 hover:text-[#D4A900] transition-colors font-medium"
                >
                    ← Go back
                </button>
            </div>
        </main>
    );
}