import React, { useState } from 'react';
import MessageChat from './MessageChat';

export const MessageButton: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 z-50 ${
                    isOpen 
                        ? 'bg-white text-[#0D0D0D] border border-neutral-200 rotate-90 scale-90' 
                        : 'bg-[#F5C518] text-[#0D0D0D] hover:scale-105 hover:shadow-2xl'
                }`}
                aria-label="Toggle feedback chat"
            >
                {isOpen ? (
                    <span className="text-xl font-bold">✕</span>
                ) : (
                    <span className="text-2xl">💬</span>
                )}
            </button>

            <MessageChat isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
};

export default MessageButton;
