import api from './axios';
import type { FeedbackRequest, FeedbackResponse } from '../types/feedback';
import type { Page, Slice } from '../types/pagination';

export const feedbackApi = {
    createFeedback: (data: FeedbackRequest) => api.post<FeedbackResponse>('/feedback', data),
    updateFeedback: (id: number, data: FeedbackRequest) => api.put<FeedbackResponse>(`/feedback/${id}`, data),
    deleteFeedback: (id: number) => api.delete<void>(`/feedback/${id}`),
    getCurrentUserFeedback: (page: number = 0, size: number = 10) => api.get<Slice<FeedbackResponse>>('/feedback/my', { params: { page, size } }),
    getAllFeedback: (page: number = 0, size: number = 20) => api.get<Page<FeedbackResponse>>('/feedback/all', { params: { page, size } }),
};
export default feedbackApi;