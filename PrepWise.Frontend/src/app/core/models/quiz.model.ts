export enum QuestionDifficulty {
    Easy = 'EASY',
    Medium = 'MEDIUM',
    Hard = 'HARD'
}

export enum QuestionLanguage {
    English = 'ENGLISH',
    Tamil = 'TAMIL'
}

export enum QuizType {
    Practice = 'PRACTICE',
    Test = 'TEST'
}

export enum QuizAttemptStatus {
    InProgress = 'IN_PROGRESS',
    Completed = 'COMPLETED',
    Abandoned = 'ABANDONED'
}

export interface QuestionOption {
    id: number;
    text: string;
    isCorrect: boolean;
    orderIndex: number;
}

export interface Question {
    id: number;
    text: string;
    explanation?: string;
    difficulty: QuestionDifficulty;
    language: QuestionLanguage;
    subjectId: number;
    subject?: Subject;
    options: QuestionOption[];
    isActive: boolean;
    createdAt: string;
}

export interface Subject {
    id: number;
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    isActive: boolean;
}

export interface Quiz {
    id: number;
    title: string;
    subjectId: number;
    subject?: Subject;
    questionCount: number;
    timeLimitMinutes: number;
    type: QuizType;
    isActive: boolean;
    createdAt: string;
}

export interface QuizAttempt {
    id: number;
    userId: number;
    quizId: number;
    quiz?: Quiz;
    startedAt: string;
    completedAt?: string;
    timeTaken?: string;
    score?: number;
    totalQuestions: number;
    correctAnswers?: number;
    wrongAnswers?: number;
    unansweredQuestions?: number;
    status: QuizAttemptStatus;
}

export interface QuizAnswer {
    questionId: number;
    selectedOptionId?: number;
    isCorrect?: boolean;
    answeredAt?: string;
}

export interface QuizResult {
    success: boolean;
    message: string;
    score: number;
    correctAnswers: number;
    wrongAnswers: number;
    unansweredQuestions: number;
}

// Input types for GraphQL mutations
export interface QuizAnswerInput {
    questionId: number;
    selectedOptionId?: number;
}

export interface StartQuizInput {
    userId: number;
    subjectId: number;
    questionCount: number;
    timeLimitMinutes: number;
} 