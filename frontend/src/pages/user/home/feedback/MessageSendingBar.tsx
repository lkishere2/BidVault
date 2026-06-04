import React, { useState } from 'react';

interface MessageSendingBarProps {
    onSend: (content: string) => Promise<void>;
    isSending: boolean;
}

export const MessageSendingBar: React.FC<MessageSendingBarProps> = ({ onSend, isSending }) => {
    const [content, setContent] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || isSending) return;
        
        await onSend(content.trim());
        setContent('');
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 border-t border-neutral-200 bg-white rounded-b-2xl">
            <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type your feedback..."
                disabled={isSending}
                className="flex-1 bg-neutral-100 border-none rounded-xl px-4 py-2.5 text-[14px] text-[#0D0D0D] outline-none focus:ring-2 focus:ring-[#F5C518] transition-all disabled:opacity-50"
            />
            <button
                type="submit"
                disabled={!content.trim() || isSending}
                className="bg-[#0D0D0D] text-[#F5C518] w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all hover:bg-[#F5C518] hover:text-[#0D0D0D] disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
                {isSending ? '...' : '➤'}
            </button>
        </form>
    );
};

export default MessageSendingBar;
