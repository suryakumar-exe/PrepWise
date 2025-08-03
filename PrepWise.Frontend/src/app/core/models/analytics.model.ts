export interface AnalyticsData {
    overallAccuracy: number;
    totalQuestions: number;
    averageTime: number;
    performanceLevel: string;
    accuracyTrend: number[];
    questionsTrend: number[];
    timeTrend: number[];
    streak: number;
    subjectPerformance: SubjectPerformance[];
    speedTrend: number[];
    insights: StudyInsight[];
    subjects: Subject[];
}

export interface SubjectPerformance {
    id: number;
    name: string;
    accuracy: number;
    correctAnswers: number;
    wrongAnswers: number;
    averageTime: number;
}

export interface StudyInsight {
    title: string;
    description: string;
    type: 'success' | 'warning' | 'info' | 'danger';
    icon: string;
    actionText?: string;
    action?: () => void;
}

export interface Subject {
    id: number;
    name: string;
}

export interface PerformanceTrend {
    date: string;
    value: number;
} 