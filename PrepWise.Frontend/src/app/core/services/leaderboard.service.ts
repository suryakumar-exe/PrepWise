import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { gql } from 'apollo-angular';
import { LeaderboardEntry, Subject, LeaderboardResult } from '../models/leaderboard.model';

const GET_LEADERBOARD = gql`
  query GetLeaderboard($subjectId: Int, $timeFrame: String) {
    leaderboard(subjectId: $subjectId, timeFrame: $timeFrame) {
      entries {
        id
        userId
        userName
        location
        score
        accuracy
        testsTaken
        isCurrentUser
      }
      currentUserRank
      currentUserScore
    }
  }
`;

const GET_SUBJECTS = gql`
  query GetSubjects {
    subjects {
      id
      name
      description
      category
    }
  }
`;

@Injectable({
    providedIn: 'root'
})
export class LeaderboardService {

    constructor(private apollo: Apollo) { }

    getLeaderboard(subjectId: number | null, timeFrame: string): Observable<LeaderboardResult> {
        return this.apollo.watchQuery({
            query: GET_LEADERBOARD,
            variables: { subjectId, timeFrame }
        }).valueChanges.pipe(
            map((result: any) => result.data.leaderboard)
        );
    }

    getSubjects(): Observable<Subject[]> {
        return this.apollo.watchQuery({
            query: GET_SUBJECTS
        }).valueChanges.pipe(
            map((result: any) => result.data.subjects)
        );
    }
} 