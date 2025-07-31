import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { gql } from 'apollo-angular';
import { MockTestAttempt, MockTestResult, StartMockTestInput, SubmitMockTestInput } from '../models/mock-test.model';

const START_MOCK_TEST = gql`
  mutation StartMockTest($input: StartMockTestInput!) {
    startMockTest(input: $input) {
      success
      message
      mockTestAttempt {
        id
        title
        startedAt
        totalQuestions
        timeLimitMinutes
        questions {
          id
          questionText
          questionTextTamil
          difficulty
          language
          options {
            id
            optionText
            optionTextTamil
          }
        }
      }
    }
  }
`;

const SUBMIT_MOCK_TEST = gql`
  mutation SubmitMockTest($input: SubmitMockTestInput!) {
    submitMockTest(input: $input) {
      success
      message
      result {
        id
        score
        correctAnswers
        wrongAnswers
        unansweredQuestions
        totalQuestions
        timeTakenMinutes
        accuracy
        performanceLevel
        subjectPerformance {
          subjectId
          subjectName
          correctAnswers
          totalQuestions
          timeTaken
        }
      }
    }
  }
`;

const GET_MOCK_TEST_HISTORY = gql`
  query GetMockTestHistory($userId: Int!) {
    mockTestHistory(userId: $userId) {
      id
      title
      startedAt
      completedAt
      totalQuestions
      score
      accuracy
      performanceLevel
    }
  }
`;

const GET_MOCK_TEST_DETAILS = gql`
  query GetMockTestDetails($mockTestId: Int!) {
    mockTestDetails(mockTestId: $mockTestId) {
      id
      title
      startedAt
      completedAt
      totalQuestions
      timeLimitMinutes
      score
      correctAnswers
      wrongAnswers
      unansweredQuestions
      accuracy
      performanceLevel
      timeTakenMinutes
      questions {
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
        userAnswer {
          selectedOptionId
          isCorrect
        }
      }
      subjectPerformance {
        subjectId
        subjectName
        correctAnswers
        totalQuestions
        timeTaken
        accuracy
      }
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class MockTestService {

  constructor(private apollo: Apollo) { }

  startMockTest(input: StartMockTestInput): Observable<any> {
    return this.apollo.mutate({
      mutation: START_MOCK_TEST,
      variables: { input }
    }).pipe(
      map((result: any) => result.data.startMockTest)
    );
  }

  submitMockTest(input: SubmitMockTestInput): Observable<any> {
    return this.apollo.mutate({
      mutation: SUBMIT_MOCK_TEST,
      variables: { input }
    }).pipe(
      map((result: any) => result.data.submitMockTest)
    );
  }

  getMockTestHistory(userId: number): Observable<MockTestAttempt[]> {
    return this.apollo.watchQuery({
      query: GET_MOCK_TEST_HISTORY,
      variables: { userId }
    }).valueChanges.pipe(
      map((result: any) => result.data.mockTestHistory)
    );
  }

  getMockTestDetails(mockTestId: number): Observable<MockTestAttempt> {
    return this.apollo.watchQuery({
      query: GET_MOCK_TEST_DETAILS,
      variables: { mockTestId }
    }).valueChanges.pipe(
      map((result: any) => result.data.mockTestDetails)
    );
  }
} 