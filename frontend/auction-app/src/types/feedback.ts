export interface FeedbackRequest {
    content: string;
}

export interface FeedbackResponse {
    id: number;
    username: string;
    email: string;
    content: string;
    adminResponse?: string;
    createdAt: string;
}

export interface FeedbackAdminResponseRequest {
    responseContent: string;
}