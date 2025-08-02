import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LeaderboardResult, LeaderboardEntry, Subject } from '../models/leaderboard.model';
import { AuthService } from './auth.service';

interface LeaderboardResponse {
  id: number;
  score: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
  subject: {
    id: number;
    name: string;
  };
}

interface LeaderboardGraphQLResponse {
  data: {
    leaderboard: LeaderboardResponse[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getLeaderboard(subjectId?: number, timeFrame: string = 'all'): Observable<LeaderboardResult> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return of(this.getEmptyLeaderboardData());
    }

    // If no subject is selected, we'll use optimistic logic for overall performance
    const querySubjectId = subjectId || 0; // 0 for overall/all subjects

    const graphqlQuery = {
      query: `
        query GetLeaderboard($subjectId: Int!) {
          leaderboard(subjectId: $subjectId) {
            id
            score
            user {
              id
              firstName
              lastName
            }
            subject {
              id
              name
            }
          }
        }
      `,
      variables: {
        subjectId: querySubjectId
      }
    };

    return this.http.post<LeaderboardGraphQLResponse>(`${this.apiUrl}/graphql`, graphqlQuery)
      .pipe(
        map(response => {
          const leaderboardData = response.data?.leaderboard || [];
          return this.processLeaderboardData(leaderboardData, currentUser.id, subjectId);
        }),
        catchError(error => {
          console.error('Error fetching leaderboard:', error);
          return of(this.getEmptyLeaderboardData());
        })
      );
  }

  private processLeaderboardData(
    leaderboardData: LeaderboardResponse[],
    currentUserId: number,
    selectedSubjectId?: number
  ): LeaderboardResult {
    if (leaderboardData.length === 0) {
      return this.getEmptyLeaderboardData();
    }

    // Sort by score in descending order
    const sortedData = [...leaderboardData].sort((a, b) => b.score - a.score);

    // Add rank to each entry
    const entries: LeaderboardEntry[] = sortedData.map((entry, index) => ({
      id: entry.id,
      userId: entry.user.id,
      userName: `${entry.user.firstName} ${entry.user.lastName}`,
      score: entry.score,
      accuracy: this.calculateAccuracy(entry.score), // Optimistic calculation
      testsTaken: this.calculateTestsTaken(entry.score), // Optimistic calculation
      rank: index + 1,
      lastActive: new Date().toISOString(),
      isCurrentUser: entry.user.id === currentUserId
    }));

    // Find current user's rank and score
    const currentUserEntry = entries.find(entry => entry.userId === currentUserId);
    const currentUserRank = currentUserEntry ? currentUserEntry.rank : null;
    const currentUserScore = currentUserEntry ? currentUserEntry.score : null;

    return {
      entries,
      totalParticipants: entries.length,
      userRank: currentUserRank || 0,
      userScore: currentUserScore || 0,
      currentUserRank: currentUserRank || null,
      currentUserScore: currentUserScore || null
    };
  }

  private calculateAccuracy(score: number): number {
    // Optimistic calculation: assume accuracy is proportional to score
    // This is a simplified calculation - in real scenario, this would come from backend
    return Math.min(100, Math.max(0, Math.round(score * 1.2)));
  }

  private calculateTestsTaken(score: number): number {
    // Optimistic calculation: assume more tests = higher score potential
    // This is a simplified calculation - in real scenario, this would come from backend
    return Math.max(1, Math.round(score / 10));
  }

  getGlobalLeaderboard(timeFrame: string = 'all'): Observable<LeaderboardResult> {
    return this.getLeaderboard(undefined, timeFrame);
  }

  getSubjectLeaderboard(subjectId: number, timeFrame: string = 'all'): Observable<LeaderboardResult> {
    return this.getLeaderboard(subjectId, timeFrame);
  }

  getSubjects(): Observable<Subject[]> {
    const graphqlQuery = {
      query: `
        query GetSubjects {
          subjects {
            id
            name
            description
            category
          }
        }
      `
    };

    return this.http.post<any>(`${this.apiUrl}/graphql`, graphqlQuery)
      .pipe(
        map(response => {
          const subjects = response.data?.subjects || [];
          return subjects.map((subject: any) => ({
            id: subject.id,
            name: subject.name,
            description: subject.description || '',
            category: subject.category || 'General'
          }));
        }),
        catchError(error => {
          console.error('Error fetching subjects:', error);
          return of([]);
        })
      );
  }

  private getEmptyLeaderboardData(): LeaderboardResult {
    return {
      entries: [],
      totalParticipants: 0,
      userRank: 0,
      userScore: 0,
      currentUserRank: null,
      currentUserScore: null
    };
  }
} 