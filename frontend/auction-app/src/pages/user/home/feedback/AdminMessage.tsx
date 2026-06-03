import React from 'react';

interface AdminMessageProps {
    content: string;
    timestamp: string;
}

export const AdminMessage: React.FC<AdminMessageProps> = ({ content, timestamp }) => {
    // Assuming the admin response might be slightly later, we just use the feedback's creation time for now,
    // or if the backend returns an adminResponseUpdatedAt we could use that. Using the provided timestamp.
    const date = new Date(timestamp);
    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="flex flex-col items-start w-full mb-4">
            <div className="flex items-end gap-2">
                <div className="w-6 h-6 rounded-full bg-[#F5C518] flex items-center justify-center shrink-0 mb-1 shadow-sm">
                    <span className="text-[10px] font-black text-[#0D0D0D]">A</span>
                </div>
                <div className="bg-neutral-100 text-[#0D0D0D] px-4 py-2.5 rounded-2xl rounded-bl-sm max-w-[85%] border border-neutral-200 shadow-sm">
                    <p className="text-[14px] leading-relaxed break-words">{content}</p>
                </div>
            </div>
            <span className="text-[11px] font-medium text-neutral-400 mt-1 ml-8">{formattedTime}</span>
        </div>
    );
};

export default AdminMessage;
