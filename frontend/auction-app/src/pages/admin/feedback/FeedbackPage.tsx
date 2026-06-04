import React, { useEffect, useState } from 'react';
import { feedbackApi } from '../../../api/feedbackApi';
import type { FeedbackResponse } from '../../../types/feedback';
import FeedbackGrid from './FeedbackGrid';
import FeedbackResponseBox from './FeedbackResponseBox';

export const FeedbackPage: React.FC = () => {
    const [feedbacks, setFeedbacks] = useState<FeedbackResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedFeedback, setSelectedFeedback] = useState<FeedbackResponse | null>(null);

    const loadFeedbacks = async () => {
        try {
            setIsLoading(true);
            const res = await feedbackApi.getAllFeedback(0, 50); // Just loading 50 for simplicity
            const data = Array.isArray(res.data?.content) ? res.data.content : [];
            setFeedbacks(data);
        } catch (error) {
            console.error("Failed to load feedbacks:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadFeedbacks();
    }, []);

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold text-[#0D0D0D] tracking-[-0.02em]">User Feedback</h1>
                <p className="text-neutral-500 text-sm mt-1">
                    Manage and respond to feedback and support requests from users.
                </p>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <div className="w-8 h-8 border-4 border-neutral-200 border-t-[#F5C518] rounded-full animate-spin"></div>
                </div>
            ) : (
                <FeedbackGrid 
                    feedbacks={feedbacks} 
                    onItemClick={setSelectedFeedback} 
                />
            )}

            {selectedFeedback && (
                <FeedbackResponseBox
                    feedback={selectedFeedback}
                    onClose={() => setSelectedFeedback(null)}
                    onSuccess={() => {
                        loadFeedbacks();
                    }}
                />
            )}
        </div>
    );
};

export default FeedbackPage;
