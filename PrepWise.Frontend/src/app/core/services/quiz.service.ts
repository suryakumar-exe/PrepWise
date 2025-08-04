import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Subject,
  Question,
  QuizAttempt,
  QuizResult,
  QuizAnswerInput,
  StartQuizInput,
  QuestionDifficulty,
  QuestionLanguage,
  GenerateAIQuestionsResponse,
  StartQuizAttemptResponse,
  SubmitQuizAnswersResponse
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
              name: 'Standard6to10',
              description: '6th to 10th Standard Tamil Language',
              category: 'Tamil',
              isActive: true
            },
            {
              id: 2,
              name: 'Tamil Grammar',
              description: 'Grammar, Literature, Comprehension',
              category: 'Tamil',
              isActive: true
            },
            {
              id: 3,
              name: 'Area and Volume',
              description: 'Area and Volume Calculations',
              category: 'Mathematics',
              isActive: true
            },
            {
              id: 4,
              name: 'Simplification',
              description: 'Mathematical Simplification',
              category: 'Mathematics',
              isActive: true
            },
            {
              id: 5,
              name: 'Percentage',
              description: 'Percentage Calculations',
              category: 'Mathematics',
              isActive: true
            },
            {
              id: 6,
              name: 'HCF and LCM',
              description: 'Highest Common Factor & LCM',
              category: 'Mathematics',
              isActive: true
            },
            {
              id: 7,
              name: 'Ratio and Proportion',
              description: 'Ratio and Proportion Problems',
              category: 'Mathematics',
              isActive: true
            },
            {
              id: 8,
              name: 'General Science',
              description: 'Physics, Chemistry, Biology',
              category: 'Science & GK',
              isActive: true
            },
            {
              id: 9,
              name: 'Current Events',
              description: 'Current Affairs & News',
              category: 'Science & GK',
              isActive: true
            },
            {
              id: 10,
              name: 'Geography',
              description: 'Indian and World Geography',
              category: 'Science & GK',
              isActive: true
            },
            {
              id: 11,
              name: 'History and Culture',
              description: 'Indian History & Culture',
              category: 'Science & GK',
              isActive: true
            },
            {
              id: 12,
              name: 'Indian Polity',
              description: 'Constitution and Politics',
              category: 'Science & GK',
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
  generateAIQuestions(subjectId: number, difficulty: QuestionDifficulty = QuestionDifficulty.Medium, language: QuestionLanguage = QuestionLanguage.English, questionCount: number = 2): Observable<Question[]> {
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
        subjectId: Number(subjectId),
        difficulty: difficulty,
        language: language,
        questionCount: Number(questionCount)
      }
    };

    return this.http.post<GenerateAIQuestionsResponse>(`${this.apiUrl}/graphql`, graphqlQuery)
      .pipe(
        map(response => {
          const questions = response.data?.generateAIQuestions;

          if (questions && Array.isArray(questions) && questions.length > 0) {
            // Transform to match frontend model
            const transformedQuestions = questions.map((q: any) => ({
              id: q.id,
              text: q.questionText,
              explanation: '',
              difficulty: q.difficulty as QuestionDifficulty,
              language: q.language as QuestionLanguage,
              subjectId: subjectId,
              isActive: true,
              createdAt: new Date().toISOString(),
              options: q.options.map((opt: any) => ({
                id: opt.id,
                text: opt.optionText,
                isCorrect: opt.isCorrect,
                orderIndex: 0
              }))
            }));
            return transformedQuestions;
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
  startQuizAttempt(userId: number, subjectId: number, questionCount: number = 2, timeLimitMinutes: number = 30): Observable<{ success: boolean; attemptId?: number; questions?: any[]; message?: string }> {
    const graphqlQuery = {
      query: `
              mutation StartQuizAttempt($userId: Int!, $subjectId: Int!, $questionCount: Int!, $timeLimitMinutes: Int!) {
                  startQuizAttempt(userId: $userId, subjectId: $subjectId, questionCount: $questionCount, timeLimitMinutes: $timeLimitMinutes) {
                      success
                      message
                      quizAttempt {
                          id
                          startedAt
                          status
                          quiz {
                              id
                              title
                              questionCount
                              timeLimitMinutes
                          }
                      }
                      questions {
                          id
                          questionText
                          questionTextTamil
                          difficulty
                          language
                          subjectId
                          options {
                              id
                              isCorrect
                              optionText
                              optionTextTamil
                              orderIndex
                          }
                      }
                  }
              }
          `,
      variables: {
        userId: Number(userId),
        subjectId: Number(subjectId),
        questionCount: Number(questionCount),
        timeLimitMinutes: Number(timeLimitMinutes)
      }
    };

    return this.http.post<StartQuizAttemptResponse>(`${this.apiUrl}/graphql?v=${Date.now()}`, graphqlQuery)
      .pipe(
        map(response => {
          console.log('=== START QUIZ ATTEMPT RESPONSE ===');
          console.log('Full response:', response);
          console.log('Response data:', response.data);

          const result = response.data?.startQuizAttempt;
          console.log('Start quiz result:', result);

          if (result?.success) {
            // Transform questions to match frontend model
            const transformedQuestions = (result.questions || []).map((q: any) => ({
              id: q.id,
              text: q.questionText, // Map questionText to text
              textTamil: q.questionTextTamil,
              difficulty: q.difficulty || 'MEDIUM',
              language: q.language || 'ENGLISH',
              subjectId: q.subjectId || subjectId,
              options: (q.options || []).map((opt: any) => ({
                id: opt.id,
                text: opt.optionText, // Map optionText to text
                textTamil: opt.optionTextTamil,
                isCorrect: opt.isCorrect,
                orderIndex: opt.orderIndex || 0
              }))
            }));

            console.log('Transformed questions:', transformedQuestions);

            return {
              success: true,
              attemptId: result.quizAttempt?.id,
              questions: transformedQuestions
            };
          }
          return { success: false, message: result?.message || 'Failed to start quiz' };
        }),
        catchError(error => {
          console.error('Error starting quiz:', error);
          console.error('Error details:', error.error);
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
  submitQuizAnswers(quizAttemptId: number, answers: QuizAnswerInput[]): Observable<{ success: boolean; score?: number; correctAnswers?: number; wrongAnswers?: number; unansweredQuestions?: number; message?: string }> {
    // Ensure quizAttemptId is a proper integer
    const attemptId = parseInt(quizAttemptId.toString(), 10);

    if (isNaN(attemptId)) {
      console.error('❌ Invalid quizAttemptId:', quizAttemptId);
      return of({ success: false, message: 'Invalid quiz attempt ID' });
    }

    console.log(`📝 Submitting answers for attempt ID: ${attemptId} (type: ${typeof attemptId})`);

    const graphqlQuery = {
      query: `
              mutation SubmitQuizAnswers($quizAttemptId: Int!, $answers: [QuizAnswerInput!]!) {
                  submitQuizAnswers(quizAttemptId: $quizAttemptId, answers: $answers) {
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
        quizAttemptId: attemptId,
        answers: answers
      }
    };

    console.log('GraphQL Query Variables:', graphqlQuery.variables);

    return this.http.post<SubmitQuizAnswersResponse>(`${this.apiUrl}/graphql`, graphqlQuery)
      .pipe(
        map(response => {
          console.log('Submit answers response:', response);
          const result = response.data?.submitQuizAnswers;
          if (result?.success) {
            return {
              success: true,
              score: result.score,
              correctAnswers: result.correctAnswers,
              wrongAnswers: result.wrongAnswers,
              unansweredQuestions: result.unansweredQuestions || 0,
              message: result.message
            };
          }
          return { success: false, message: result?.message || 'Failed to submit answers' };
        }),
        catchError(error => {
          console.error('❌ Error submitting quiz answers:', error);
          console.error('Error details:', error.error);
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

  // Get quiz result by attempt ID using submitQuizAnswers mutation
  getQuizResult(attemptId: number): Observable<QuizResult> {
    console.log('=== FETCHING QUIZ RESULT ===');
    console.log('Attempt ID:', attemptId);

    const graphqlQuery = {
      query: `
                query GetQuizResult($quizAttemptId: Int!) {
                    getQuizResult(quizAttemptId: $quizAttemptId) {
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
        quizAttemptId: Number(attemptId)
      }
    };

    console.log('GraphQL Query:', JSON.stringify(graphqlQuery, null, 2));
    console.log('API URL:', `${this.apiUrl}/graphql`);

    return this.http.post<any>(`${this.apiUrl}/graphql`, graphqlQuery)
      .pipe(
        map(response => {
          console.log('=== QUIZ RESULT RESPONSE ===');
          console.log('Full response:', response);
          console.log('Response data:', response.data);
          console.log('Response errors:', response.errors);

          const result = response.data?.getQuizResult;
          console.log('Quiz result from response:', result);

          if (result) {
            const transformedResult = {
              success: result.success,
              message: result.message,
              score: result.score || 0,
              correctAnswers: result.correctAnswers || 0,
              wrongAnswers: result.wrongAnswers || 0,
              unansweredQuestions: result.unansweredQuestions || 0
            };
            console.log('✅ Transformed result:', transformedResult);
            return transformedResult;
          }

          console.log('❌ No quiz result found in response');
          return {
            success: false,
            message: 'Result not found',
            score: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            unansweredQuestions: 0
          };
        }),
        catchError(error => {
          console.error('❌ Error fetching quiz result:', error);
          console.error('Error details:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            url: error.url
          });
          return of({
            success: false,
            message: 'Failed to load result',
            score: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            unansweredQuestions: 0
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