import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AnalyticsData } from '../models/analytics.model';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAnalytics(timeFrame: string, subjectId: number | null): Observable<AnalyticsData> {
    let url = `${this.apiUrl}/api/analytics`;
    const params: any = { timeFrame };
    if (subjectId) params.subjectId = subjectId;

    return this.http.get<AnalyticsData>(url, { params })
      .pipe(
        catchError(error => {
          console.error('Error fetching analytics:', error);
          // Return mock data for now
          return of({
            overallAccuracy: 75,
            totalQuestions: 100,
            averageTime: 2.5,
            performanceLevel: 'Good',
            accuracyTrend: 75,
            questionsTrend: 25,
            timeTrend: 2.5,
            streak: 5,
            subjectPerformance: [
              {
                id: 1,
                name: 'Mathematics',
                accuracy: 80,
                correctAnswers: 40,
                wrongAnswers: 10,
                averageTime: 2.2
              },
              {
                id: 2,
                name: 'Science',
                accuracy: 70,
                correctAnswers: 35,
                wrongAnswers: 15,
                averageTime: 2.8
              }
            ],
            speedTrend: [2.8, 2.5, 2.2, 2.6, 2.1, 2.5],
            insights: [
              {
                title: 'Improving in Mathematics',
                description: 'Your accuracy in Mathematics has improved by 15% this week',
                type: 'success' as const,
                icon: 'trending-up',
                actionText: 'Continue Practice'
              }
            ],
            subjects: [
              { id: 1, name: 'Mathematics' },
              { id: 2, name: 'Science' }
            ]
          });
        })
      );
  }
} 