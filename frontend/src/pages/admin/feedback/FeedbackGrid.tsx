import React from 'react';
import type { FeedbackResponse } from '../../../types/feedback';
import FeedbackItem from './FeedbackItem';

interface FeedbackGridProps {
    feedbacks: FeedbackResponse[];
    onItemClick: (feedback: FeedbackResponse) => void;
}

export const FeedbackGrid: React.FC<FeedbackGridProps> = ({ feedbacks, onItemClick }) => {
    if (feedbacks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-neutral-50 rounded-2xl border border-neutral-200 border-dashed text-center">
                <div className="text-4xl mb-4 opacity-50">📬</div>
                <h3 className="text-lg font-bold text-[#0D0D0D]">No Feedback Yet</h3>
                <p className="text-neutral-500 mt-1 max-w-md">There are no feedback messages to display at this time.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {feedbacks.map((fb) => (
                <FeedbackItem 
                    key={fb.id} 
                    feedback={fb} 
                    onClick={onItemClick} 
                />
            ))}
        </div>
    );
};

export default FeedbackGrid;
