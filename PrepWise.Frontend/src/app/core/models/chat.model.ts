export enum ChatMessageType {
    UserMessage = 'USER_MESSAGE',
    AIResponse = 'AI_RESPONSE',
    SystemMessage = 'SYSTEM_MESSAGE'
}

export interface ChatMessage {
    id: number;
    content: string;
    isUser: boolean;
    timestamp: Date;
    type: 'text' | 'image' | 'file';
}

export interface ChatResponse {
    success: boolean;
    message: string;
    response?: string | ChatMessage;
}

export interface SkillScore {
    id: number;
    userId: number;
    user?: any;
    subjectId: number;
    subject?: any;
    score: number;
    totalAttempts: number;
    correctAnswers: number;
    totalQuestions: number;
    averageDifficulty: string;
    lastUpdated: string;
}

export interface LeaderboardEntry {
    rank: number;
    user: {
        id: number;
        firstName: string;
        lastName: string;
    };
    subject?: {
        id: number;
        name: string;
    };
    score: number;
    totalAttempts: number;
} 