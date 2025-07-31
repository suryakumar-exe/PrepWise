export interface LeaderboardEntry {
    id: number;
    userId: number;
    userName: string;
    location?: string;
    score: number;
    accuracy: number;
    testsTaken: number;
    isCurrentUser: boolean;
}

export interface Subject {
    id: number;
    name: string;
    description: string;
    category: string;
}

export interface LeaderboardResult {
    entries: LeaderboardEntry[];
    currentUserRank: number | null;
    currentUserScore: number | null;
} 