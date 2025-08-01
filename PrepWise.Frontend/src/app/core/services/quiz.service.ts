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
    const graphqlQuery = {
      query: `
                query GetSubjects {
                    subjects {
                        id
                        name
                        description
                        category
                        isActive
                    }
                }
            `
    };

    return this.http.post<any>(`${this.apiUrl}/graphql`, graphqlQuery)
      .pipe(
        map(response => response.data?.subjects || []),
        catchError(error => {
          console.error('Error fetching subjects:', error);
          // Return mock data for now
          return of([
            {
              id: 1,
              name: 'Standard 6',
              description: '6th Standard Tamil Language',
              category: 'Tamil',
              isActive: true
            },
            {
              id: 2,
              name: 'Standard 7',
              description: '7th Standard Tamil Language',
              category: 'Tamil',
              isActive: true
            },
            {
              id: 3,
              name: 'Standard 8',
              description: '8th Standard Tamil Language',
              category: 'Tamil',
              isActive: true
            },
            {
              id: 4,
              name: 'Standard 9',
              description: '9th Standard Tamil Language',
              category: 'Tamil',
              isActive: true
            },
            {
              id: 5,
              name: 'Standard 10',
              description: '10th Standard Tamil Language',
              category: 'Tamil',
              isActive: true
            },
            {
              id: 6,
              name: 'Tamil Grammar',
              description: 'Grammar, Literature, Comprehension',
              category: 'Tamil',
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
    const graphqlQuery = {
      query: `
                query GetQuestionsBySubject($subjectId: Int!, $difficulty: QuestionDifficulty, $language: QuestionLanguage) {
                    questionsBySubject(subjectId: $subjectId, difficulty: $difficulty, language: $language) {
                        id
                        questionText
                        questionTextTamil
                        difficulty
                        language
                        subjectId
                        options {
                            id
                            optionText
                            optionTextTamil
                            isCorrect
                            orderIndex
                        }
                        isActive
                        createdAt
                    }
                }
            `,
      variables: { subjectId, difficulty, language }
    };

    return this.http.post<any>(`${this.apiUrl}/graphql`, graphqlQuery)
      .pipe(
        map(response => {
          // Transform backend response to match frontend model
          const questions = response.data?.questionsBySubject || [];
          return questions.map((q: any) => ({
            id: q.id,
            text: q.questionText, // Map questionText to text
            explanation: q.explanation,
            difficulty: q.difficulty,
            language: q.language,
            subjectId: q.subjectId,
            options: q.options.map((opt: any) => ({
              id: opt.id,
              text: opt.optionText, // Map optionText to text
              isCorrect: opt.isCorrect,
              orderIndex: opt.orderIndex
            })),
            isActive: q.isActive,
            createdAt: q.createdAt
          }));
        }),
        catchError(error => {
          console.error('Error fetching questions:', error);
          // Return mock data for now
          return of([
            {
              id: 1,
              text: 'What is 2 + 2?',
              explanation: 'Basic addition',
              difficulty: 'MEDIUM' as QuestionDifficulty,
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

  // Generate AI questions for practice
  generateAIQuestions(subjectId: number, difficulty: string = 'MEDIUM', language: string = 'ENGLISH', questionCount: number = 10): Observable<any> {
    const graphqlQuery = {
      query: `
              query GenerateAIQuestions($subjectId: Int!, $difficulty: QuestionDifficulty!, $language: QuestionLanguage!, $questionCount: Int!) {
                  generateAIQuestions(subjectId: $subjectId, difficulty: $difficulty, language: $language, questionCount: $questionCount) {
                      id
                      questionText
                      questionTextTamil
                      difficulty
                      language
                      options {
                          id
                          optionText
                          optionTextTamil
                          isCorrect
                      }
                  }
              }
          `,
      variables: {
        subjectId: subjectId,
        difficulty: difficulty,
        language: language,
        questionCount: questionCount
      }
    };

    return this.http.post<any>(`${this.apiUrl}/graphql`, graphqlQuery)
      .pipe(
        map(response => {
          const questions = response.data?.generateAIQuestions;
          if (questions) {
            // Transform to match frontend model
            return questions.map((q: any) => ({
              id: q.id,
              text: q.questionText,
              explanation: '',
              difficulty: q.difficulty,
              language: q.language,
              subjectId: subjectId,
              options: q.options.map((opt: any) => ({
                id: opt.id,
                text: opt.optionText,
                isCorrect: opt.isCorrect,
                orderIndex: 0
              }))
            }));
          }
          return [];
        }),
        catchError(error => {
          console.error('Error generating AI questions:', error);
          return of([]);
        })
      );
  }

  // Start a quiz attempt
  startQuizAttempt(userId: number, subjectId: number, questionCount: number = 10, timeLimitMinutes: number = 30): Observable<any> {
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
        subjectId: subjectId,
        questionCount: questionCount,
        timeLimitMinutes: timeLimitMinutes
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
          return { success: false, message: 'Failed to start quiz' };
        }),
        catchError(error => {
          console.error('Error starting quiz:', error);
          return of({ success: false, message: 'Failed to start quiz' });
        })
      );
  }

  // Get quiz attempt details
  getQuizAttempt(attemptId: number): Observable<any> {
    const graphqlQuery = {
      query: `
        query GetQuizAttempt($attemptId: Int!) {
          quizAttempt(id: $attemptId) {
            id
            quiz {
              id
              title
              questionCount
              timeLimitMinutes
            }
            startedAt
            status
            questions {
              id
              text
              options {
                id
                text
                isCorrect
              }
            }
          }
        }
      `,
      variables: {
        attemptId: attemptId
      }
    };

    return this.http.post<any>(`${this.apiUrl}/graphql`, graphqlQuery)
      .pipe(
        map(response => {
          const attempt = response.data?.quizAttempt;
          if (attempt) {
            return {
              id: attempt.id,
              timeLimitMinutes: attempt.quiz?.timeLimitMinutes || 30,
              questions: attempt.questions || []
            };
          }
          return null;
        }),
        catchError(error => {
          console.error('Error fetching quiz attempt:', error);
          return of(null);
        })
      );
  }

  // Submit quiz answers
  submitQuizAnswers(quizAttemptId: number, answers: any[]): Observable<any> {
    const graphqlQuery = {
      query: `
              mutation SubmitQuizAnswers($quizAttemptId: Int!, $answers: [QuizAnswerInput!]!) {
                  submitQuizAnswers(quizAttemptId: $quizAttemptId, answers: $answers) {
                      success
                      message
                      score
                      correctAnswers
                      wrongAnswers
                  }
              }
          `,
      variables: {
        quizAttemptId: quizAttemptId,
        answers: answers
      }
    };

    return this.http.post<any>(`${this.apiUrl}/graphql`, graphqlQuery)
      .pipe(
        map(response => {
          const result = response.data?.submitQuizAnswers;
          if (result?.success) {
            return {
              success: true,
              score: result.score,
              correctAnswers: result.correctAnswers,
              wrongAnswers: result.wrongAnswers,
              message: result.message
            };
          }
          return { success: false, message: 'Failed to submit answers' };
        }),
        catchError(error => {
          console.error('Error submitting quiz answers:', error);
          return of({ success: false, message: 'Failed to submit answers' });
        })
      );
  }

  // Get user's quiz attempts
  getUserQuizAttempts(userId: number): Observable<QuizAttempt[]> {
    const graphqlQuery = {
      query: `
                query GetUserQuizAttempts($userId: Int!) {
                    userQuizAttempts(userId: $userId) {
                        id
                        userId
                        quizId
                        quiz {
                            id
                            title
                            subject {
                                id
                                name
                            }
                        }
                        startedAt
                        completedAt
                        timeTaken
                        score
                        totalQuestions
                        correctAnswers
                        wrongAnswers
                        unansweredQuestions
                        status
                    }
                }
            `,
      variables: { userId }
    };

    return this.http.post<any>(`${this.apiUrl}/graphql`, graphqlQuery)
      .pipe(
        map(response => response.data?.userQuizAttempts || []),
        catchError(error => {
          console.error('Error fetching quiz attempts:', error);
          return of([]);
        })
      );
  }

  // Get quiz result by attempt ID
  getQuizResult(attemptId: number): Observable<QuizResult> {
    const graphqlQuery = {
      query: `
                query GetQuizResult($attemptId: Int!) {
                    quizResult(attemptId: $attemptId) {
                        success
                        message
                        score
                        correctAnswers
                        wrongAnswers
                        unansweredQuestions
                        timeTaken
                        subjectPerformance {
                            subjectId
                            subjectName
                            correctAnswers
                            totalQuestions
                            accuracy
                        }
                    }
                }
            `,
      variables: { attemptId }
    };

    return this.http.post<any>(`${this.apiUrl}/graphql`, graphqlQuery)
      .pipe(
        map(response => response.data?.quizResult || {
          success: false,
          message: 'Result not found',
          score: 0,
          correctAnswers: 0,
          wrongAnswers: 0,
          unansweredQuestions: 0,
          timeTaken: 0,
          subjectPerformance: []
        }),
        catchError(error => {
          console.error('Error fetching quiz result:', error);
          return of({
            success: false,
            message: 'Failed to load result',
            score: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            unansweredQuestions: 0,
            timeTaken: 0,
            subjectPerformance: []
          });
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