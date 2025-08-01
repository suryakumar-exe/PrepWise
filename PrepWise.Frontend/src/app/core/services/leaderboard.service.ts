import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LeaderboardEntry, Subject, LeaderboardResult } from '../models/leaderboard.model';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getLeaderboard(subjectId: number | null, timeFrame: string): Observable<LeaderboardResult> {
    let url = `${this.apiUrl}/api/leaderboard`;
    const params: any = { timeFrame };
    if (subjectId) params.subjectId = subjectId;

    return this.http.get<LeaderboardResult>(url, { params })
      .pipe(
        catchError(error => {
          console.error('Error fetching leaderboard:', error);
          // Return mock data for now
          return of({
            entries: [
              {
                id: 1,
                userId: 1,
                userName: 'John Doe',
                location: 'Chennai',
                score: 95,
                accuracy: 95,
                testsTaken: 10,
                isCurrentUser: true
              },
              {
                id: 2,
                userId: 2,
                userName: 'Jane Smith',
                location: 'Mumbai',
                score: 92,
                accuracy: 92,
                testsTaken: 8,
                isCurrentUser: false
              }
            ],
            currentUserRank: 1,
            currentUserScore: 95
          });
        })
      );
  }

  getSubjects(): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.apiUrl}/api/subjects`)
      .pipe(
        catchError(error => {
          console.error('Error fetching subjects:', error);
          return of([
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
          ]);
        })
      );
  }
} 