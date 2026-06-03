import React from 'react';

interface ClientMessageProps {
    content: string;
    timestamp: string;
}

export const ClientMessage: React.FC<ClientMessageProps> = ({ content, timestamp }) => {
    const date = new Date(timestamp);
    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="flex flex-col items-end w-full mb-4">
            <div className="bg-[#0D0D0D] text-white px-4 py-2.5 rounded-2xl rounded-br-sm max-w-[85%] shadow-sm">
                <p className="text-[14px] leading-relaxed break-words">{content}</p>
            </div>
            <span className="text-[11px] font-medium text-neutral-400 mt-1">{formattedTime}</span>
        </div>
    );
};

export default ClientMessage;
