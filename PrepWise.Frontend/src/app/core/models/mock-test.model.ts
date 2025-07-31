export interface MockTestAttempt {
    id: number;
    title: string;
    startedAt: string;
    completedAt?: string;
    totalQuestions: number;
    timeLimitMinutes: number;
    status: 'in_progress' | 'completed' | 'abandoned';
    questions?: Question[];
    score?: number;
    correctAnswers?: number;
    wrongAnswers?: number;
    unansweredQuestions?: number;
    accuracy?: number;
    performanceLevel?: string;
    timeTakenMinutes?: number;
}

export interface Question {
    id: number;
    questionText: string;
    questionTextTamil?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    language: 'english' | 'tamil' | 'bilingual';
    options: QuestionOption[];
    userAnswer?: UserAnswer;
}

export interface QuestionOption {
    id: number;
    optionText: string;
    optionTextTamil?: string;
    isCorrect?: boolean;
}

export interface UserAnswer {
    selectedOptionId: number;
    isCorrect: boolean;
}

export interface MockTestAnswer {
    questionId: number;
    selectedOptionId: number;
}

export interface StartMockTestInput {
    title: string;
    questionCount: number;
    timeLimitMinutes: number;
}

export interface SubmitMockTestInput {
    mockTestAttemptId: number;
    answers: MockTestAnswer[];
}

export interface MockTestResult {
    id: number;
    score: number;
    correctAnswers: number;
    wrongAnswers: number;
    unansweredQuestions: number;
    totalQuestions: number;
    timeTakenMinutes: number;
    accuracy: number;
    performanceLevel: string;
    subjectPerformance: SubjectPerformance[];
}

export interface SubjectPerformance {
    subjectId: number;
    subjectName: string;
    correctAnswers: number;
    totalQuestions: number;
    timeTaken: number;
    accuracy?: number;
}

export interface MockTestHistory {
    id: number;
    title: string;
    startedAt: string;
    completedAt: string;
    totalQuestions: number;
    score: number;
    accuracy: number;
    performanceLevel: string;
} 