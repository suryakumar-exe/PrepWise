import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MockTestAttempt, MockTestResult, StartMockTestInput, SubmitMockTestInput } from '../models/mock-test.model';

@Injectable({
  providedIn: 'root'
})
export class MockTestService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  startMockTest(input: StartMockTestInput): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/mock-test/start`, input)
      .pipe(
        catchError(error => {
          console.error('Error starting mock test:', error);
          return of({
            success: false,
            message: 'Failed to start mock test',
            mockTestAttempt: null
          });
        })
      );
  }

  submitMockTest(input: SubmitMockTestInput): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/mock-test/submit`, input)
      .pipe(
        catchError(error => {
          console.error('Error submitting mock test:', error);
          return of({
            success: false,
            message: 'Failed to submit mock test',
            result: null
          });
        })
      );
  }

  getMockTestHistory(userId: number): Observable<MockTestAttempt[]> {
    return this.http.get<MockTestAttempt[]>(`${this.apiUrl}/api/mock-test/history/${userId}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching mock test history:', error);
          return of([]);
        })
      );
  }

  getMockTestDetails(mockTestId: number): Observable<MockTestAttempt> {
    return this.http.get<MockTestAttempt>(`${this.apiUrl}/api/mock-test/details/${mockTestId}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching mock test details:', error);
          return of(null as any);
        })
      );
  }

  // Utility methods
  calculateAccuracy(correctAnswers: number, totalQuestions: number): number {
    if (totalQuestions === 0) return 0;
    return Math.round((correctAnswers / totalQuestions) * 100);
  }

  getPerformanceLevel(accuracy: number): string {
    if (accuracy >= 90) return 'Excellent';
    if (accuracy >= 80) return 'Very Good';
    if (accuracy >= 70) return 'Good';
    if (accuracy >= 60) return 'Average';
    if (accuracy >= 50) return 'Below Average';
    return 'Poor';
  }

  formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  calculateTimeSpent(startTime: string, endTime: string): number {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    return Math.floor((end - start) / (1000 * 60)); // Return minutes
  }
} 