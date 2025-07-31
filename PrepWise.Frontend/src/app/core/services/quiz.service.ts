import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Apollo, gql } from 'apollo-angular';
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

// GraphQL Queries
const GET_SUBJECTS = gql`
  query GetSubjects {
    subjects {
      id
      name
      description
      icon
      color
      isActive
    }
  }
`;

const GET_QUESTIONS_BY_SUBJECT = gql`
  query GetQuestionsBySubject($subjectId: Int!, $difficulty: QuestionDifficulty, $language: QuestionLanguage) {
    questionsBySubject(subjectId: $subjectId, difficulty: $difficulty, language: $language) {
      id
      text
      explanation
      difficulty
      language
      subjectId
      options {
        id
        text
        isCorrect
        orderIndex
      }
      isActive
      createdAt
    }
  }
`;

const GENERATE_AI_QUESTIONS = gql`
  mutation GenerateAIQuestions($subjectId: Int!, $questionCount: Int!, $difficulty: QuestionDifficulty!, $language: QuestionLanguage!) {
    generateAIQuestions(subjectId: $subjectId, questionCount: $questionCount, difficulty: $difficulty, language: $language) {
      id
      text
      explanation
      difficulty
      language
      subjectId
      options {
        id
        text
        isCorrect
        orderIndex
      }
      isActive
      createdAt
    }
  }
`;

const START_QUIZ_ATTEMPT = gql`
  mutation StartQuizAttempt($userId: Int!, $subjectId: Int!, $questionCount: Int!, $timeLimitMinutes: Int!) {
    startQuizAttempt(userId: $userId, subjectId: $subjectId, questionCount: $questionCount, timeLimitMinutes: $timeLimitMinutes) {
      success
      message
      quizAttempt {
        id
        userId
        quizId
        startedAt
        totalQuestions
        status
      }
      questions {
        id
        text
        explanation
        difficulty
        language
        subjectId
        options {
          id
          text
          isCorrect
          orderIndex
        }
      }
    }
  }
`;

const SUBMIT_QUIZ_ANSWERS = gql`
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
`;

const GET_USER_QUIZ_ATTEMPTS = gql`
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
`;

@Injectable({
    providedIn: 'root'
})
export class QuizService {
    constructor(private apollo: Apollo) { }

    // Get all subjects
    getSubjects(): Observable<Subject[]> {
        return this.apollo.query<{ subjects: Subject[] }>({
            query: GET_SUBJECTS,
            fetchPolicy: 'cache-first'
        }).pipe(
            map(result => result.data.subjects)
        );
    }

    // Get questions by subject with optional filters
    getQuestionsBySubject(
        subjectId: number,
        difficulty?: QuestionDifficulty,
        language?: QuestionLanguage
    ): Observable<Question[]> {
        return this.apollo.query<{ questionsBySubject: Question[] }>({
            query: GET_QUESTIONS_BY_SUBJECT,
            variables: { subjectId, difficulty, language },
            fetchPolicy: 'cache-first'
        }).pipe(
            map(result => result.data.questionsBySubject)
        );
    }

    // Generate AI questions
    generateAIQuestions(
        subjectId: number,
        questionCount: number,
        difficulty: QuestionDifficulty,
        language: QuestionLanguage
    ): Observable<Question[]> {
        return this.apollo.mutate<{ generateAIQuestions: Question[] }>({
            mutation: GENERATE_AI_QUESTIONS,
            variables: { subjectId, questionCount, difficulty, language }
        }).pipe(
            map(result => result.data?.generateAIQuestions || [])
        );
    }

    // Start a quiz attempt
    startQuizAttempt(quizData: StartQuizInput): Observable<any> {
        return this.apollo.mutate<{ startQuizAttempt: any }>({
            mutation: START_QUIZ_ATTEMPT,
            variables: quizData
        }).pipe(
            map(result => result.data?.startQuizAttempt)
        );
    }

    // Submit quiz answers
    submitQuizAnswers(quizAttemptId: number, answers: QuizAnswerInput[]): Observable<QuizResult> {
        return this.apollo.mutate<{ submitQuizAnswers: QuizResult }>({
            mutation: SUBMIT_QUIZ_ANSWERS,
            variables: { quizAttemptId, answers }
        }).pipe(
            map(result => result.data?.submitQuizAnswers!)
        );
    }

    // Get user's quiz attempts
    getUserQuizAttempts(userId: number): Observable<QuizAttempt[]> {
        return this.apollo.query<{ userQuizAttempts: QuizAttempt[] }>({
            query: GET_USER_QUIZ_ATTEMPTS,
            variables: { userId },
            fetchPolicy: 'cache-first'
        }).pipe(
            map(result => result.data.userQuizAttempts)
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