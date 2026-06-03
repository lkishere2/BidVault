import React, { useState } from 'react';
import type { FeedbackResponse } from '../../../types/feedback';
import { feedbackApi } from '../../../api/feedbackApi';

interface FeedbackResponseBoxProps {
    feedback: FeedbackResponse;
    onSuccess: () => void;
    onClose: () => void;
}

export const FeedbackResponseBox: React.FC<FeedbackResponseBoxProps> = ({ feedback, onSuccess, onClose }) => {
    const [responseContent, setResponseContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!responseContent.trim()) return;

        try {
            setIsSubmitting(true);
            await feedbackApi.respondToFeedback(feedback.id, { responseContent: responseContent.trim() });
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error submitting response:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                <div className="bg-[#0D0D0D] text-white px-6 py-4 flex justify-between items-center">
                    <h3 className="font-bold text-lg">Respond to Feedback</h3>
                    <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors">
                        ✕
                    </button>
                </div>
                
                <div className="p-6">
                    <div className="bg-neutral-50 rounded-xl p-4 mb-4 border border-neutral-200">
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold text-[#0D0D0D]">{feedback.username}</span>
                            <span className="text-xs text-neutral-500">{new Date(feedback.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-neutral-700 whitespace-pre-wrap">{feedback.content}</p>
                    </div>

                    {feedback.adminResponse && (
                        <div className="bg-blue-50 text-blue-900 rounded-xl p-4 mb-4 border border-blue-100">
                            <span className="text-xs font-bold uppercase tracking-wider block mb-1">Previous Response</span>
                            <p className="text-sm whitespace-pre-wrap">{feedback.adminResponse}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <label className="block text-sm font-semibold text-[#0D0D0D] mb-2">
                            Your Response
                        </label>
                        <textarea
                            value={responseContent}
                            onChange={(e) => setResponseContent(e.target.value)}
                            className="w-full h-32 p-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#F5C518] focus:border-[#F5C518] transition-all outline-none resize-none text-sm"
                            placeholder="Type your response here..."
                            disabled={isSubmitting}
                        ></textarea>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="px-5 py-2.5 rounded-xl font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!responseContent.trim() || isSubmitting}
                                className="px-5 py-2.5 rounded-xl font-bold bg-[#F5C518] text-[#0D0D0D] hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-[#0D0D0D] border-t-transparent rounded-full animate-spin"></div>
                                        Sending...
                                    </>
                                ) : 'Send Response'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FeedbackResponseBox;
