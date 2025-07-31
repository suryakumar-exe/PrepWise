import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, UserProfile } from '../models/profile.model';

const GET_USER_PROFILE = gql`
  query GetUserProfile {
    userProfile {
      id
      firstName
      lastName
      email
      phone
      location
      bio
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($input: UpdateUserProfileInput!) {
    updateUserProfile(input: $input) {
      id
      firstName
      lastName
      email
      phone
      location
      bio
      updatedAt
    }
  }
`;

const CHANGE_PASSWORD = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input) {
      success
      message
    }
  }
`;

const GET_USER_ACHIEVEMENTS = gql`
  query GetUserAchievements {
    userAchievements {
      id
      title
      description
      icon
      earned
      earnedAt
    }
  }
`;

const GET_TEST_HISTORY = gql`
  query GetTestHistory {
    testHistory {
      id
      type
      subject
      score
      totalQuestions
      correctAnswers
      timeTaken
      completedAt
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  constructor(private apollo: Apollo) { }

  getUserProfile(): Observable<UserProfile> {
    return this.apollo.query<{ userProfile: UserProfile }>({
      query: GET_USER_PROFILE
    }).pipe(
      map(result => result.data?.userProfile!)
    );
  }

  updateUserProfile(profile: Partial<UserProfile>): Observable<UserProfile> {
    return this.apollo.mutate<{ updateUserProfile: UserProfile }>({
      mutation: UPDATE_USER_PROFILE,
      variables: {
        input: profile
      }
    }).pipe(
      map(result => result.data?.updateUserProfile!)
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{ success: boolean; message: string }> {
    return this.apollo.mutate<{ changePassword: { success: boolean; message: string } }>({
      mutation: CHANGE_PASSWORD,
      variables: {
        input: {
          currentPassword,
          newPassword
        }
      }
    }).pipe(
      map(result => result.data?.changePassword!)
    );
  }

  getUserAchievements(): Observable<any[]> {
    return this.apollo.query<{ userAchievements: any[] }>({
      query: GET_USER_ACHIEVEMENTS
    }).pipe(
      map(result => result.data?.userAchievements || [])
    );
  }

  getTestHistory(): Observable<any[]> {
    return this.apollo.query<{ testHistory: any[] }>({
      query: GET_TEST_HISTORY
    }).pipe(
      map(result => result.data?.testHistory || [])
    );
  }
} 