import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LeaderboardResult, LeaderboardEntry } from '../models/leaderboard.model';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getLeaderboard(subjectId?: number, timeFrame: string = 'all'): Observable<LeaderboardResult> {
    const graphqlQuery = {
      query: `
                query GetLeaderboard($subjectId: Int, $timeFrame: String) {
                    leaderboard(subjectId: $subjectId, timeFrame: $timeFrame) {
                        entries {
                            userId
                            userName
                            score
                            accuracy
                            testsTaken
                            rank
                            lastActive
                        }
                        totalParticipants
                        userRank
                        userScore
                    }
                }
            `,
      variables: {
        subjectId: subjectId || null,
        timeFrame: timeFrame
      }
    };

    return this.http.post<any>(`${this.apiUrl}/graphql`, graphqlQuery)
      .pipe(
        map(response => {
          const data = response.data?.leaderboard;
          if (data) {
            return {
              entries: data.entries || [],
              totalParticipants: data.totalParticipants || 0,
              userRank: data.userRank || 0,
              userScore: data.userScore || 0,
              currentUserRank: data.userRank || null,
              currentUserScore: data.userScore || null
            };
          }
          return this.getMockLeaderboardData();
        }),
        catchError(error => {
          console.error('Error fetching leaderboard:', error);
          return of(this.getMockLeaderboardData());
        })
      );
  }

  getGlobalLeaderboard(timeFrame: string = 'all'): Observable<LeaderboardResult> {
    return this.getLeaderboard(undefined, timeFrame);
  }

  getSubjectLeaderboard(subjectId: number, timeFrame: string = 'all'): Observable<LeaderboardResult> {
    return this.getLeaderboard(subjectId, timeFrame);
  }

  getSubjects(): Observable<any[]> {
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
          const subjects = response.data?.subjects;
          return subjects || this.getMockSubjects();
        }),
        catchError(error => {
          console.error('Error fetching subjects:', error);
          return of(this.getMockSubjects());
        })
      );
  }

  private getMockSubjects(): any[] {
    return [
      {
        id: 1,
        name: 'Mathematics',
        description: 'Basic mathematics concepts',
        category: 'Science'
      },
      {
        id: 2,
        name: 'Science',
        description: 'General science topics',
        category: 'Science'
      }
    ];
  }

  private getMockLeaderboardData(): LeaderboardResult {
    return {
      entries: [
        {
          userId: 1,
          userName: 'John Doe',
          score: 95,
          accuracy: 92,
          testsTaken: 15,
          rank: 1,
          lastActive: new Date().toISOString()
        },
        {
          userId: 2,
          userName: 'Jane Smith',
          score: 88,
          accuracy: 85,
          testsTaken: 12,
          rank: 2,
          lastActive: new Date().toISOString()
        },
        {
          userId: 3,
          userName: 'Mike Johnson',
          score: 82,
          accuracy: 78,
          testsTaken: 10,
          rank: 3,
          lastActive: new Date().toISOString()
        }
      ],
      totalParticipants: 150,
      userRank: 5,
      userScore: 75,
      currentUserRank: 5,
      currentUserScore: 75
    };
  }
} 