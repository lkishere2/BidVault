import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LoginNotificationProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoginNotification({ isOpen, onClose }: LoginNotificationProps) {
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-[400px] bg-white rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col items-center text-center">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-[#0D0D0D] transition-colors rounded-full hover:bg-neutral-100"
                    aria-label="Close"
                >
                    <X size={20} strokeWidth={2} />
                </button>

                <div className="w-[60px] h-[60px] bg-[#F5C518]/10 text-[#F5C518] flex items-center justify-center rounded-full mb-5">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                </div>

                <h2 className="text-[22px] font-bold text-[#0D0D0D] mb-2">Login Required</h2>
                <p className="text-[14px] text-neutral-500 mb-8 max-w-[280px]">
                    You need to be logged in to access this feature. Please log in or create an account to continue.
                </p>

                <div className="w-full flex flex-col gap-3">
                    <button
                        onClick={() => {
                            onClose();
                            navigate('/login');
                        }}
                        className="w-full py-3.5 bg-[#F5C518] hover:bg-[#F5C518]/90 text-[#0D0D0D] font-semibold rounded-xl transition-colors shadow-sm"
                    >
                        Log In
                    </button>
                    <button
                        onClick={() => {
                            onClose();
                            navigate('/register');
                        }}
                        className="w-full py-3.5 bg-white border-2 border-[#0D0D0D] text-[#0D0D0D] hover:bg-neutral-50 font-semibold rounded-xl transition-colors"
                    >
                        Sign Up
                    </button>
                </div>
            </div>
        </div>
    );
}
