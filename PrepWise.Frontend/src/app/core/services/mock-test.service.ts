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

  constructor(private http: HttpClient) {
    console.log('MockTestService constructor called'); // Debug log
  }

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

  startMockTest(userId: number, title: string = "First Attempt", timeLimitMinutes: number = 5): Observable<any> {
    const graphqlQuery = {
      query: `
        mutation StartMockTest($userId: Int!, $title: String!, $timeLimitMinutes: Int!) {
          startMockTest(userId: $userId, title: $title, timeLimitMinutes: $timeLimitMinutes) {
            success
            message
            mockTestAttempt {
              id
              title
              startedAt
              totalQuestions
            }
            questions {
              id
              questionText
              questionTextTamil
              options {
                id
                questionId
                optionText
                optionTextTamil
                isCorrect
              }
            }
          }
        }
      `,
      variables: {
        userId: userId,
        title: title,
        timeLimitMinutes: timeLimitMinutes
      }
    };

    return this.http.post<any>(`${this.apiUrl}/graphql`, graphqlQuery)
      .pipe(
        map(response => {
          const result = response.data?.startMockTest;
          if (result?.success) {
            return {
              success: true,
              message: result.message,
              mockTestAttempt: result.mockTestAttempt,
              questions: result.questions
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

  submitMockTest(mockTestAttemptId: number, answers: any[]): Observable<MockTestResult> {
    const graphqlQuery = {
      query: `
        mutation SubmitMockTestAnswers($mockTestAttemptId: Int!, $answers: [MockTestAnswerInput!]!) {
          submitMockTestAnswers(mockTestAttemptId: $mockTestAttemptId, answers: $answers) {
            success
            message
            score
            correctAnswers
            wrongAnswers
            unansweredQuestions
          }
        }
      `,
      variables: {
        mockTestAttemptId: mockTestAttemptId,
        answers: answers
      }
    };

    return this.http.post<any>(`${this.apiUrl}/graphql`, graphqlQuery)
      .pipe(
        map(response => {
          const result = response.data?.submitMockTestAnswers;
          if (result?.success) {
            return {
              success: true,
              message: result.message,
              score: result.score,
              correctAnswers: result.correctAnswers,
              wrongAnswers: result.wrongAnswers,
              unansweredQuestions: result.unansweredQuestions
            };
          }
          return { success: false, message: result?.message || 'Failed to submit mock test' };
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