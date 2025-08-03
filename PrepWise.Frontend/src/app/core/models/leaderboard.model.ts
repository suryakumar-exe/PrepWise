export interface LeaderboardEntry {
    id?: number;
    userId: number;
    userName: string;
    location?: string;
    score: number;
    accuracy: number;
    testsTaken: number;
    rank?: number;
    lastActive?: string;
    isCurrentUser?: boolean;
}

export interface Subject {
    id: number;
    name: string;
    description: string;
    category: string;
}

export interface LeaderboardResult {
    entries: LeaderboardEntry[];
    totalParticipants?: number;
    userRank?: number;
    userScore?: number;
    currentUserRank: number | null;
    currentUserScore: number | null;
} 