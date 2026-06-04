import React, { useEffect, useState, useRef } from 'react';
import { feedbackApi } from '../../../../api/feedbackApi';
import type { FeedbackResponse } from '../../../../types/feedback';
import ClientMessage from './ClientMessage';
import AdminMessage from './AdminMessage';
import MessageSendingBar from './MessageSendingBar';

interface MessageChatProps {
    isOpen: boolean;
    onClose: () => void;
}

export const MessageChat: React.FC<MessageChatProps> = ({ isOpen, onClose }) => {
    const [feedbacks, setFeedbacks] = useState<FeedbackResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            loadFeedbacks();
        }
    }, [isOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [feedbacks, isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadFeedbacks = async () => {
        try {
            setIsLoading(true);
            // Slice defaults to page=0, size=10, we'll fetch 50 just to show a good history
            const res = await feedbackApi.getCurrentUserFeedback(0, 50);
            // Backend sorts by createdAt descending, so we need to reverse to show oldest at top, newest at bottom
            const data = Array.isArray(res.data?.content) ? res.data.content : [];
            setFeedbacks([...data].reverse());
        } catch (error) {
            console.error("Error fetching feedbacks:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async (content: string) => {
        try {
            setIsSending(true);
            const res = await feedbackApi.createFeedback({ content });
            setFeedbacks(prev => [...prev, res.data]);
        } catch (error) {
            console.error("Error sending feedback:", error);
        } finally {
            setIsSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-24 right-6 w-[350px] h-[500px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-neutral-200 flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
            {/* Header */}
            <div className="bg-[#0D0D0D] text-white p-4 flex items-center justify-between shadow-md z-10 relative">
                <div>
                    <h3 className="font-black text-[16px] tracking-tight text-[#F5C518]">Support & Feedback</h3>
                    <p className="text-[12px] text-neutral-400 font-medium">We usually reply within 24 hours</p>
                </div>
                <button 
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-neutral-400 hover:text-white"
                >
                    ✕
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#FAFAFA] flex flex-col">
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-[#F5C518] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : feedbacks.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 px-4">
                        <div className="text-4xl mb-3">💬</div>
                        <p className="text-[14px] font-bold text-[#0D0D0D]">No messages yet</p>
                        <p className="text-[12px] font-medium text-neutral-500 mt-1">Send us a message to get started!</p>
                    </div>
                ) : (
                    <>
                        {feedbacks.map((fb) => (
                            <React.Fragment key={fb.id}>
                                <ClientMessage content={fb.content} timestamp={fb.createdAt} />
                                {fb.adminResponse && (
                                    <AdminMessage content={fb.adminResponse} timestamp={fb.createdAt} />
                                )}
                            </React.Fragment>
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input Area */}
            <MessageSendingBar onSend={handleSend} isSending={isSending} />
        </div>
    );
};

export default MessageChat;
