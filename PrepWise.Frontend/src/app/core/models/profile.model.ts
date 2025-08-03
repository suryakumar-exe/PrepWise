export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    location?: string;
    bio?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    location?: string;
    bio?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface UpdateUserProfileInput {
    firstName?: string;
    lastName?: string;
    phone?: string;
    location?: string;
    bio?: string;
}

export interface ChangePasswordInput {
    currentPassword: string;
    newPassword: string;
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    earned: boolean;
    earnedAt?: Date;
}

export interface TestHistoryEntry {
    id: string;
    type: string;
    subject: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    timeTaken: number;
    completedAt: Date;
} 