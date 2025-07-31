import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { gql } from 'apollo-angular';
import { AnalyticsData } from '../models/analytics.model';

const GET_ANALYTICS = gql`
  query GetAnalytics($timeFrame: String, $subjectId: Int) {
    analytics(timeFrame: $timeFrame, subjectId: $subjectId) {
      overallAccuracy
      totalQuestions
      averageTime
      performanceLevel
      accuracyTrend
      questionsTrend
      timeTrend
      streak
      subjectPerformance {
        id
        name
        accuracy
        correctAnswers
        wrongAnswers
        averageTime
      }
      accuracyTrend
      speedTrend
      insights {
        title
        description
        type
        icon
        actionText
      }
      subjects {
        id
        name
      }
    }
  }
`;

@Injectable({
    providedIn: 'root'
})
export class AnalyticsService {

    constructor(private apollo: Apollo) { }

    getAnalytics(timeFrame: string, subjectId: number | null): Observable<AnalyticsData> {
        return this.apollo.watchQuery({
            query: GET_ANALYTICS,
            variables: { timeFrame, subjectId }
        }).valueChanges.pipe(
            map((result: any) => result.data.analytics)
        );
    }
} 