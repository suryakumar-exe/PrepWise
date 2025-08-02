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
      console.log('No current user found, returning empty data');
      return of(this.getEmptyLeaderboardData());
    }

    // If no subject is selected, we'll use optimistic logic for overall performance
    const querySubjectId = subjectId || 0; // 0 for overall/all subjects

    console.log('=== LEADERBOARD REQUEST ===');
    console.log('Current User ID:', currentUser.id);
    console.log('Selected Subject ID:', subjectId);
    console.log('Query Subject ID:', querySubjectId);
    console.log('Time Frame:', timeFrame);

    // Try different query approaches based on whether subject is selected
    let graphqlQuery;

    if (subjectId) {
      // Specific subject query
      graphqlQuery = {
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
          subjectId: subjectId
        }
      };
    } else {
      // Overall leaderboard query - try without subjectId parameter
      graphqlQuery = {
        query: `
          query GetLeaderboard {
            leaderboard {
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
        `
      };
    }

    console.log('GraphQL Query:', JSON.stringify(graphqlQuery, null, 2));

    return this.http.post<LeaderboardGraphQLResponse>(`${this.apiUrl}/graphql`, graphqlQuery)
      .pipe(
        map(response => {
          console.log('=== LEADERBOARD RESPONSE ===');
          console.log('Full Response:', response);
          console.log('Response Data:', response.data);
          console.log('Leaderboard Data:', response.data?.leaderboard);

          const leaderboardData = response.data?.leaderboard || [];
          console.log('Processed Leaderboard Data:', leaderboardData);

          // If no data and we're querying for a specific subject, try a fallback
          if (leaderboardData.length === 0 && subjectId) {
            console.log('No data found for specific subject, trying fallback query...');
            // This will be handled by the error catch below
            throw new Error('No data found for specific subject');
          }

          const result = this.processLeaderboardData(leaderboardData, currentUser.id, subjectId);
          console.log('Final Processed Result:', result);
          console.log('=== END LEADERBOARD RESPONSE ===');

          return result;
        }),
        catchError(error => {
          console.error('=== LEADERBOARD ERROR ===');
          console.error('Error fetching leaderboard:', error);
          console.error('Error details:', error.error);

          // If this was a specific subject query that failed, try the overall query
          if (subjectId && error.message === 'No data found for specific subject') {
            console.log('Trying overall leaderboard query as fallback...');
            const fallbackQuery = {
              query: `
                query GetLeaderboard {
                  leaderboard {
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
              `
            };

            return this.http.post<LeaderboardGraphQLResponse>(`${this.apiUrl}/graphql`, fallbackQuery)
              .pipe(
                map(fallbackResponse => {
                  console.log('Fallback response:', fallbackResponse);
                  const fallbackData = fallbackResponse.data?.leaderboard || [];
                  return this.processLeaderboardData(fallbackData, currentUser.id, subjectId);
                }),
                catchError(fallbackError => {
                  console.error('Fallback query also failed:', fallbackError);
                  return of(this.getEmptyLeaderboardData());
                })
              );
          }

          console.error('=== END LEADERBOARD ERROR ===');
          return of(this.getEmptyLeaderboardData());
        })
      );
  }

  private processLeaderboardData(
    leaderboardData: LeaderboardResponse[],
    currentUserId: number,
    selectedSubjectId?: number
  ): LeaderboardResult {
    console.log('=== PROCESSING LEADERBOARD DATA ===');
    console.log('Input leaderboardData:', leaderboardData);
    console.log('Current User ID:', currentUserId);
    console.log('Selected Subject ID:', selectedSubjectId);

    if (leaderboardData.length === 0) {
      console.log('No leaderboard data found, returning empty result');
      return this.getEmptyLeaderboardData();
    }

    // Remove duplicates based on user ID and score combination
    const uniqueData = leaderboardData.reduce((acc, current) => {
      const key = `${current.user.id}-${current.score}`;
      if (!acc.find(item => `${item.user.id}-${item.score}` === key)) {
        acc.push(current);
      } else {
        console.log('Removing duplicate entry:', current);
      }
      return acc;
    }, [] as LeaderboardResponse[]);

    console.log('After deduplication:', uniqueData);

    // Sort by score in descending order
    const sortedData = [...uniqueData].sort((a, b) => b.score - a.score);
    console.log('Sorted data:', sortedData);

    // Add rank to each entry
    const entries: LeaderboardEntry[] = sortedData.map((entry, index) => {
      const processedEntry = {
        id: entry.id,
        userId: entry.user.id,
        userName: `${entry.user.firstName} ${entry.user.lastName}`,
        score: entry.score,
        accuracy: this.calculateAccuracy(entry.score), // Optimistic calculation
        testsTaken: this.calculateTestsTaken(entry.score), // Optimistic calculation
        rank: index + 1,
        lastActive: new Date().toISOString(),
        isCurrentUser: entry.user.id === currentUserId
      };
      console.log(`Processed entry ${index + 1}:`, processedEntry);
      return processedEntry;
    });

    console.log('All processed entries:', entries);

    // Find current user's rank and score
    const currentUserEntry = entries.find(entry => entry.userId === currentUserId);
    const currentUserRank = currentUserEntry ? currentUserEntry.rank : null;
    const currentUserScore = currentUserEntry ? currentUserEntry.score : null;

    console.log('Current user entry:', currentUserEntry);
    console.log('Current user rank:', currentUserRank);
    console.log('Current user score:', currentUserScore);

    const result = {
      entries,
      totalParticipants: entries.length,
      userRank: currentUserRank || 0,
      userScore: currentUserScore || 0,
      currentUserRank: currentUserRank || null,
      currentUserScore: currentUserScore || null
    };

    console.log('Final result:', result);
    console.log('=== END PROCESSING LEADERBOARD DATA ===');

    return result;
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
    console.log('=== LOADING SUBJECTS ===');

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

    console.log('Subjects GraphQL Query:', JSON.stringify(graphqlQuery, null, 2));

    return this.http.post<any>(`${this.apiUrl}/graphql`, graphqlQuery)
      .pipe(
        map(response => {
          console.log('Subjects Response:', response);
          const subjects = response.data?.subjects || [];
          console.log('Raw subjects from response:', subjects);

          const processedSubjects = subjects.map((subject: any) => ({
            id: subject.id,
            name: subject.name,
            description: subject.description || '',
            category: subject.category || 'General'
          }));

          console.log('Processed subjects:', processedSubjects);
          console.log('=== END LOADING SUBJECTS ===');
          return processedSubjects;
        }),
        catchError(error => {
          console.error('Error fetching subjects:', error);
          console.error('Error details:', error.error);
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

  // Test method to manually test the leaderboard query
  testLeaderboardQuery(subjectId: number = 12): Observable<LeaderboardResult> {
    console.log('=== TESTING LEADERBOARD QUERY ===');
    console.log('Testing with subject ID:', subjectId);

    const testQuery = {
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
        subjectId: subjectId
      }
    };

    console.log('Test Query:', JSON.stringify(testQuery, null, 2));

    return this.http.post<LeaderboardGraphQLResponse>(`${this.apiUrl}/graphql`, testQuery)
      .pipe(
        map(response => {
          console.log('Test Response:', response);
          const leaderboardData = response.data?.leaderboard || [];
          console.log('Test Leaderboard Data:', leaderboardData);

          const currentUser = this.authService.getCurrentUser();
          const result = this.processLeaderboardData(leaderboardData, currentUser?.id || 1, subjectId);
          console.log('Test Result:', result);
          console.log('=== END TESTING LEADERBOARD QUERY ===');

          return result;
        }),
        catchError(error => {
          console.error('Test Query Error:', error);
          return of(this.getEmptyLeaderboardData());
        })
      );
  }
} 