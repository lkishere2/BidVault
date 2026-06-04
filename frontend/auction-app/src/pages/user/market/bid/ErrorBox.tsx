import { X, AlertCircle } from 'lucide-react';

interface ErrorBoxProps {
    message: string;
    onClose: () => void;
}

export default function ErrorBox({ message, onClose }: ErrorBoxProps) {
    if (!message) return null;

    return (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-white border border-red-200 shadow-lg rounded-2xl p-4 flex items-center gap-3 max-w-md w-full">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                    <AlertCircle size={20} className="text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-[14px] font-bold text-[#0D0D0D]">Error</h4>
                    <p className="text-[13px] text-gray-500 leading-snug break-words">{message}</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-[#0D0D0D] transition-colors rounded-full hover:bg-gray-100 flex-shrink-0"
                >
                    <X size={16} strokeWidth={2} />
                </button>
            </div>
        </div>
    );
}
