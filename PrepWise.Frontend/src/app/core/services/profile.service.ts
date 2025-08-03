import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, UserProfile } from '../models/profile.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/api/profile`)
      .pipe(
        catchError(error => {
          console.error('Error fetching user profile:', error);
          // Return mock data for now
          return of({
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '+91 9876543210',
            location: 'Chennai, Tamil Nadu',
            bio: 'Passionate learner focused on improving my skills.',
            createdAt: new Date(),
            updatedAt: new Date()
          });
        })
      );
  }

  updateUserProfile(profile: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/api/profile`, profile)
      .pipe(
        catchError(error => {
          console.error('Error updating user profile:', error);
          return of(null as any);
        })
      );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{ success: boolean; message: string }> {
    const payload = { currentPassword, newPassword };
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/api/profile/change-password`, payload)
      .pipe(
        catchError(error => {
          console.error('Error changing password:', error);
          return of({
            success: false,
            message: 'Failed to change password'
          });
        })
      );
  }

  getUserAchievements(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/profile/achievements`)
      .pipe(
        catchError(error => {
          console.error('Error fetching user achievements:', error);
          return of([
            {
              id: '1',
              title: 'First Quiz',
              description: 'Completed your first quiz',
              icon: 'trophy',
              earned: true,
              earnedAt: new Date()
            },
            {
              id: '2',
              title: 'Perfect Score',
              description: 'Achieved 100% accuracy in a quiz',
              icon: 'star',
              earned: false,
              earnedAt: null
            }
          ]);
        })
      );
  }

  getTestHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/profile/test-history`)
      .pipe(
        catchError(error => {
          console.error('Error fetching test history:', error);
          return of([
            {
              id: '1',
              type: 'Quiz',
              subject: 'Mathematics',
              score: 85,
              totalQuestions: 20,
              correctAnswers: 17,
              timeTaken: 15,
              completedAt: new Date()
            }
          ]);
        })
      );
  }
} 