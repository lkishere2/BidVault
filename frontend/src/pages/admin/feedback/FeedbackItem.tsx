import React from 'react';
import type { FeedbackResponse } from '../../../types/feedback';

interface FeedbackItemProps {
    feedback: FeedbackResponse;
    onClick: (feedback: FeedbackResponse) => void;
}

export const FeedbackItem: React.FC<FeedbackItemProps> = ({ feedback, onClick }) => {
    const isResponded = !!feedback.adminResponse;

    return (
        <div 
            onClick={() => onClick(feedback)}
            className="bg-white border border-neutral-200 rounded-xl p-5 hover:border-[#F5C518] hover:shadow-md transition-all cursor-pointer group flex flex-col h-full"
        >
            <div className="flex justify-between items-start mb-3 gap-2">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-neutral-500 uppercase shrink-0">
                        {feedback.username.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-[#0D0D0D] truncate">{feedback.username}</h4>
                        <span className="text-xs text-neutral-500 truncate block">{feedback.email}</span>
                    </div>
                </div>
                <div className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isResponded ? 'bg-green-100 text-green-700' : 'bg-[#F5C518]/20 text-[#0D0D0D]'
                }`}>
                    {isResponded ? 'Responded' : 'Needs Reply'}
                </div>
            </div>

            <p className="text-sm text-neutral-700 flex-1 line-clamp-3 mb-4">
                {feedback.content}
            </p>

            <div className="mt-auto pt-4 border-t border-neutral-100 flex justify-between items-center">
                <span className="text-xs font-medium text-neutral-400">
                    {new Date(feedback.createdAt).toLocaleDateString()}
                </span>
                <span className="text-xs font-bold text-[#F5C518] opacity-0 group-hover:opacity-100 transition-opacity">
                    Respond ➔
                </span>
            </div>
        </div>
    );
};

export default FeedbackItem;
