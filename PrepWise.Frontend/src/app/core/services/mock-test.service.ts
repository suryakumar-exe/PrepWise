import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MockTest, MockTestAttempt, MockTestResult } from '../models/mock-test.model';

@Injectable({
  providedIn: 'root'
})
export class MockTestService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getMockTests(): Observable<MockTest[]> {
    const graphqlQuery = {
      query: `
                query GetMockTests {
                    mockTests {
                        id
                        title
                        description
                        questionCount
                        timeLimitMinutes
                        isActive
                    }
                }
            `
    };

    return this.http.post<any>(`${this.apiUrl}/graphql`, graphqlQuery)
      .pipe(
        map(response => {
          const tests = response.data?.mockTests;
          return tests || this.getMockMockTests();
        }),
        catchError(error => {
          console.error('Error fetching mock tests:', error);
          return of(this.getMockMockTests());
        })
      );
  }

  startMockTest(userId: number): Observable<any> {
    const graphqlQuery = {
      query: `
                mutation StartQuizAttempt($userId: Int!, $subjectId: Int!, $questionCount: Int!, $timeLimitMinutes: Int!) {
                    startQuizAttempt(userId: $userId, subjectId: $subjectId, questionCount: $questionCount, timeLimitMinutes: $timeLimitMinutes) {
                        success
                        message
                        quizAttempt {
                            id
                            quiz {
                                id
                                title
                                questionCount
                                timeLimitMinutes
                            }
                            startedAt
                            status
                        }
                    }
                }
            `,
      variables: {
        userId: userId,
        subjectId: 1, // Default subject for mock test
        questionCount: 4, // Default question count for mock test
        timeLimitMinutes: 5 // Default time limit for mock test
      }
    };

    return this.http.post<any>(`${this.apiUrl}/graphql`, graphqlQuery)
      .pipe(
        map(response => {
          const result = response.data?.startQuizAttempt;
          if (result?.success) {
            return {
              success: true,
              attemptId: result.quizAttempt?.id,
              quizAttempt: result.quizAttempt
            };
          }
          return { success: false, message: result?.message || 'Failed to start mock test' };
        }),
        catchError(error => {
          console.error('Error starting mock test:', error);
          return of({ success: false, message: 'Failed to start mock test' });
        })
      );
  }

  submitMockTest(attemptId: number, answers: any[]): Observable<MockTestResult> {
    const graphqlQuery = {
      query: `
                mutation SubmitMockTest($attemptId: Int!, $answers: [MockTestAnswerInput!]!) {
                    submitMockTest(attemptId: $attemptId, answers: $answers) {
                        success
                        score
                        correctAnswers
                        totalQuestions
                        timeTaken
                        result {
                            id
                            score
                            correctAnswers
                            totalQuestions
                            timeTaken
                            completedAt
                        }
                    }
                }
            `,
      variables: {
        attemptId: attemptId,
        answers: answers
      }
    };

    return this.http.post<any>(`${this.apiUrl}/graphql`, graphqlQuery)
      .pipe(
        map(response => {
          const result = response.data?.submitMockTest;
          if (result?.success) {
            return {
              success: true,
              score: result.score,
              correctAnswers: result.correctAnswers,
              totalQuestions: result.totalQuestions,
              timeTaken: result.timeTaken,
              result: result.result
            };
          }
          return { success: false, message: 'Failed to submit mock test' };
        }),
        catchError(error => {
          console.error('Error submitting mock test:', error);
          return of({ success: false, message: 'Failed to submit mock test' });
        })
      );
  }

  getMockTestHistory(): Observable<MockTestAttempt[]> {
    const graphqlQuery = {
      query: `
                query GetMockTestHistory {
                    mockTestHistory {
                        id
                        testId
                        startedAt
                        completedAt
                        score
                        status
                    }
                }
            `
    };

    return this.http.post<any>(`${this.apiUrl}/graphql`, graphqlQuery)
      .pipe(
        map(response => {
          const history = response.data?.mockTestHistory;
          return history || [];
        }),
        catchError(error => {
          console.error('Error fetching mock test history:', error);
          return of([]);
        })
      );
  }

  private getMockMockTests(): MockTest[] {
    return [
      {
        id: 1,
        title: 'TNPSC Group 1 Mock Test 1',
        description: 'Full-length mock test for TNPSC Group 1',
        questionCount: 200,
        timeLimitMinutes: 180,
        isActive: true
      },
      {
        id: 2,
        title: 'TNPSC Group 2 Mock Test 1',
        description: 'Full-length mock test for TNPSC Group 2',
        questionCount: 150,
        timeLimitMinutes: 150,
        isActive: true
      }
    ];
  }
} 