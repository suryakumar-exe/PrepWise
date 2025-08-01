import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Subject,
  Question,
  QuizAttempt,
  QuizResult,
  QuizAnswerInput,
  StartQuizInput,
  QuestionDifficulty,
  QuestionLanguage
} from '../models/quiz.model';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Get all subjects
  getSubjects(): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.apiUrl}/api/subjects`)
      .pipe(
        catchError(error => {
          console.error('Error fetching subjects:', error);
          // Return mock data for now
          return of([
            {
              id: 1,
              name: 'Mathematics',
              description: 'Basic mathematics concepts',
              icon: 'calculator',
              color: '#007bff',
              isActive: true
            },
            {
              id: 2,
              name: 'Science',
              description: 'General science topics',
              icon: 'flask',
              color: '#28a745',
              isActive: true
            }
          ]);
        })
      );
  }

  // Get questions by subject with optional filters
  getQuestionsBySubject(
    subjectId: number,
    difficulty?: QuestionDifficulty,
    language?: QuestionLanguage
  ): Observable<Question[]> {
    let url = `${this.apiUrl}/api/questions/subject/${subjectId}`;
    const params: any = {};
    if (difficulty) params.difficulty = difficulty;
    if (language) params.language = language;

    return this.http.get<Question[]>(url, { params })
      .pipe(
        catchError(error => {
          console.error('Error fetching questions:', error);
          // Return mock data for now
          return of([
            {
              id: 1,
              text: 'What is 2 + 2?',
              explanation: 'Basic addition',
              difficulty: 'EASY' as QuestionDifficulty,
              language: 'ENGLISH' as QuestionLanguage,
              subjectId: subjectId,
              options: [
                { id: 1, text: '3', isCorrect: false, orderIndex: 1 },
                { id: 2, text: '4', isCorrect: true, orderIndex: 2 },
                { id: 3, text: '5', isCorrect: false, orderIndex: 3 },
                { id: 4, text: '6', isCorrect: false, orderIndex: 4 }
              ],
              isActive: true,
              createdAt: new Date().toISOString()
            }
          ]);
        })
      );
  }

  // Generate AI questions
  generateAIQuestions(
    subjectId: number,
    questionCount: number,
    difficulty: QuestionDifficulty,
    language: QuestionLanguage
  ): Observable<Question[]> {
    const payload = { subjectId, questionCount, difficulty, language };
    return this.http.post<Question[]>(`${this.apiUrl}/api/questions/generate`, payload)
      .pipe(
        catchError(error => {
          console.error('Error generating AI questions:', error);
          return of([]);
        })
      );
  }

  // Start a quiz attempt
  startQuizAttempt(quizData: StartQuizInput): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/quiz/start`, quizData)
      .pipe(
        catchError(error => {
          console.error('Error starting quiz:', error);
          return of({
            success: false,
            message: 'Failed to start quiz',
            quizAttempt: null,
            questions: []
          });
        })
      );
  }

  // Submit quiz answers
  submitQuizAnswers(quizAttemptId: number, answers: QuizAnswerInput[]): Observable<QuizResult> {
    const payload = { quizAttemptId, answers };
    return this.http.post<QuizResult>(`${this.apiUrl}/api/quiz/submit`, payload)
      .pipe(
        catchError(error => {
          console.error('Error submitting quiz answers:', error);
          return of({
            success: false,
            message: 'Failed to submit answers',
            score: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            unansweredQuestions: 0
          });
        })
      );
  }

  // Get user's quiz attempts
  getUserQuizAttempts(userId: number): Observable<QuizAttempt[]> {
    return this.http.get<QuizAttempt[]>(`${this.apiUrl}/api/quiz/attempts/${userId}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching quiz attempts:', error);
          return of([]);
        })
      );
  }

  // Utility methods
  calculateTimeSpent(startTime: string, endTime: string): number {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    return Math.floor((end - start) / 1000); // Return seconds
  }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  calculatePercentage(correct: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
  }

  getScoreColor(percentage: number): string {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'danger';
  }
} 