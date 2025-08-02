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
  totalAttempts: number;
  correctAnswers: number;
  totalQuestions: number;
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
  private callCounter = 0; // Track service calls

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getLeaderboard(subjectId?: number, timeFrame: string = 'all'): Observable<LeaderboardResult> {
    this.callCounter++;
    console.log(`=== LEADERBOARD SERVICE CALL #${this.callCounter} ===`);
    console.log(`=== SERVICE VERSION: 2.0 (Updated Fields) ===`);
    console.log(`=== CALL STACK: ${new Error().stack?.split('\n')[2] || 'Unknown'} ===`);

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
              totalAttempts
              correctAnswers
              totalQuestions
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
              totalAttempts
              correctAnswers
              totalQuestions
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
    console.log('=== QUERY DETAILS ===');
    console.log('Subject ID:', subjectId);
    console.log('Time Frame:', timeFrame);
    console.log('Query Type:', subjectId ? 'Specific Subject' : 'Overall');
    console.log('Fields Requested:', subjectId ?
      'id, score, totalAttempts, correctAnswers, totalQuestions, user, subject' :
      'id, score, totalAttempts, correctAnswers, totalQuestions, user, subject');

    // Add cache-busting parameter to force fresh data
    const url = `${this.apiUrl}/graphql?v=${Date.now()}`;

    return this.http.post<LeaderboardGraphQLResponse>(url, graphqlQuery)
      .pipe(
        map(response => {
          console.log('=== LEADERBOARD RESPONSE ===');
          console.log('Full Response:', response);
          console.log('Response Data:', response.data);
          console.log('Leaderboard Data:', response.data?.leaderboard);
          console.log('Leaderboard Data Length:', response.data?.leaderboard?.length);

          if (response.data?.leaderboard) {
            console.log('=== DETAILED LEADERBOARD DATA ===');
            response.data.leaderboard.forEach((entry, index) => {
              console.log(`Entry ${index + 1}:`, {
                id: entry.id,
                score: entry.score,
                totalAttempts: entry.totalAttempts,
                correctAnswers: entry.correctAnswers,
                totalQuestions: entry.totalQuestions,
                calculatedAccuracy: entry.totalQuestions > 0 ? Math.round((entry.correctAnswers / entry.totalQuestions) * 100) : 0,
                userId: entry.user.id,
                userName: `${entry.user.firstName} ${entry.user.lastName}`,
                subjectId: entry.subject.id,
                subjectName: entry.subject.name
              });
            });
          }

          const leaderboardData = response.data?.leaderboard || [];

          if (leaderboardData.length === 0 && subjectId) {
            console.log('No data found for specific subject, trying fallback query...');
            throw new Error('No data found for specific subject'); // Trigger catchError
          }

          return this.processLeaderboardData(leaderboardData, currentUser.id, subjectId);
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
                    totalAttempts
                    correctAnswers
                    totalQuestions
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

            return this.http.post<LeaderboardGraphQLResponse>(`${this.apiUrl}/graphql?v=${Date.now()}`, fallbackQuery)
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

    // Remove duplicates based on user ID only - keep the highest score for each user
    const userMap = new Map<number, LeaderboardResponse>();

    leaderboardData.forEach(entry => {
      const existingEntry = userMap.get(entry.user.id);
      if (!existingEntry || entry.score > existingEntry.score) {
        userMap.set(entry.user.id, entry);
        if (existingEntry) {
          console.log(`Replacing lower score entry for user ${entry.user.id}: ${existingEntry.score} -> ${entry.score}`);
        }
      } else {
        console.log(`Skipping lower score entry for user ${entry.user.id}: ${entry.score} (existing: ${existingEntry.score})`);
      }
    });

    const uniqueData = Array.from(userMap.values());
    console.log('After deduplication (by user ID):', uniqueData);

    // Sort by score in descending order
    const sortedData = [...uniqueData].sort((a, b) => b.score - a.score);
    console.log('Sorted data:', sortedData);

    // Add rank to each entry
    const entries: LeaderboardEntry[] = sortedData.map((entry, index) => {
      // Calculate actual accuracy from correctAnswers and totalQuestions
      const accuracy = entry.totalQuestions > 0
        ? Math.round((entry.correctAnswers / entry.totalQuestions) * 100)
        : 0;

      const processedEntry = {
        id: entry.id,
        userId: entry.user.id,
        userName: `${entry.user.firstName} ${entry.user.lastName}`,
        score: entry.score,
        accuracy: accuracy, // Use actual calculated accuracy
        testsTaken: entry.totalAttempts, // Use actual totalAttempts
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
            totalAttempts
            correctAnswers
            totalQuestions
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

    return this.http.post<LeaderboardGraphQLResponse>(`${this.apiUrl}/graphql?v=${Date.now()}`, testQuery)
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