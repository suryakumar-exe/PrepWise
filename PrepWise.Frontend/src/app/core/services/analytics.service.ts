import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AnalyticsData, SubjectPerformance, StudyInsight, Subject } from '../models/analytics.model';
import { AuthService } from './auth.service';

interface UserSkillScore {
  id: number;
  score: number;
  totalAttempts: number;
  correctAnswers: number;
  totalQuestions: number;
  subject: {
    id: number;
    name: string;
  };
}

interface UserSkillScoresResponse {
  data: {
    userSkillScores: UserSkillScore[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getAnalytics(timeFrame: string, subjectId: number | null): Observable<AnalyticsData> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return of(this.getEmptyAnalytics());
    }

    const graphqlQuery = {
      query: `
        query GetUserSkillScores($userId: Int!) {
          userSkillScores(userId: $userId) {
            id
            score
            totalAttempts
            correctAnswers
            totalQuestions
            subject {
              id
              name
            }
          }
        }
      `,
      variables: {
        userId: currentUser.id
      }
    };

    return this.http.post<UserSkillScoresResponse>(`${this.apiUrl}/graphql`, graphqlQuery)
      .pipe(
        map(response => {
          const skillScores = response.data?.userSkillScores || [];
          return this.calculateAnalytics(skillScores, subjectId);
        }),
        catchError(error => {
          console.error('Error fetching analytics:', error);
          return of(this.getEmptyAnalytics());
        })
      );
  }

  private calculateAnalytics(skillScores: UserSkillScore[], selectedSubjectId: number | null): AnalyticsData {
    // Filter by selected subject if specified
    const filteredScores = selectedSubjectId
      ? skillScores.filter(score => score.subject.id === selectedSubjectId)
      : skillScores;

    if (filteredScores.length === 0) {
      return this.getEmptyAnalytics();
    }

    // Calculate overall metrics
    const totalCorrectAnswers = filteredScores.reduce((sum, score) => sum + score.correctAnswers, 0);
    const totalQuestions = filteredScores.reduce((sum, score) => sum + score.totalQuestions, 0);
    const totalAttempts = filteredScores.reduce((sum, score) => sum + score.totalAttempts, 0);

    // Calculate overall accuracy
    const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrectAnswers / totalQuestions) * 100) : 0;

    // Calculate average time per question (assuming 2 minutes per question as default)
    const averageTime = totalQuestions > 0 ? Math.round((totalAttempts * 2) / totalQuestions * 10) / 10 : 0;

    // Calculate performance level
    const performanceLevel = this.getPerformanceLevel(overallAccuracy);

    // Calculate total wrong answers
    const totalWrongAnswers = totalQuestions - totalCorrectAnswers;

    // Generate subject performance data
    const subjectPerformance: SubjectPerformance[] = filteredScores.map(score => {
      const accuracy = score.totalQuestions > 0 ? Math.round((score.correctAnswers / score.totalQuestions) * 100) : 0;
      const wrongAnswers = score.totalQuestions - score.correctAnswers;
      const avgTime = score.totalQuestions > 0 ? Math.round((score.totalAttempts * 2) / score.totalQuestions * 10) / 10 : 0;

      return {
        id: score.subject.id,
        name: score.subject.name,
        accuracy,
        correctAnswers: score.correctAnswers,
        wrongAnswers,
        averageTime: avgTime
      };
    });

    // Generate subjects list for dropdown
    const subjects: Subject[] = skillScores.map(score => ({
      id: score.subject.id,
      name: score.subject.name
    }));

    // Generate insights
    const insights = this.generateInsights(subjectPerformance, overallAccuracy);

    // Generate trend data (simplified for now)
    const accuracyTrend = this.generateTrendData(overallAccuracy, 6);
    const questionsTrend = this.generateTrendData(totalQuestions, 6);
    const timeTrend = this.generateTrendData(averageTime, 6);
    const speedTrend = this.generateTrendData(averageTime, 6);

    return {
      overallAccuracy,
      totalQuestions,
      averageTime,
      performanceLevel,
      accuracyTrend,
      questionsTrend,
      timeTrend,
      streak: this.calculateStreak(filteredScores),
      subjectPerformance,
      speedTrend,
      insights,
      subjects
    };
  }

  private getPerformanceLevel(accuracy: number): string {
    if (accuracy >= 90) return 'Excellent';
    if (accuracy >= 80) return 'Very Good';
    if (accuracy >= 70) return 'Good';
    if (accuracy >= 60) return 'Average';
    if (accuracy >= 50) return 'Below Average';
    return 'Needs Improvement';
  }

  private generateTrendData(currentValue: number, points: number): number[] {
    const trend = [];
    const baseValue = Math.max(0, currentValue - (currentValue * 0.3));
    const increment = (currentValue - baseValue) / (points - 1);

    for (let i = 0; i < points; i++) {
      trend.push(Math.round((baseValue + (increment * i)) * 10) / 10);
    }

    return trend;
  }

  private calculateStreak(skillScores: UserSkillScore[]): number {
    // Simplified streak calculation - could be enhanced with actual attempt dates
    const totalAttempts = skillScores.reduce((sum, score) => sum + score.totalAttempts, 0);
    return Math.min(totalAttempts, 30); // Cap at 30 days
  }

  private generateInsights(subjectPerformance: SubjectPerformance[], overallAccuracy: number): StudyInsight[] {
    const insights: StudyInsight[] = [];

    // Find best performing subject
    const bestSubject = subjectPerformance.reduce((best, current) =>
      current.accuracy > best.accuracy ? current : best, subjectPerformance[0]);

    // Find worst performing subject
    const worstSubject = subjectPerformance.reduce((worst, current) =>
      current.accuracy < worst.accuracy ? current : worst, subjectPerformance[0]);

    if (bestSubject && bestSubject.accuracy >= 80) {
      insights.push({
        title: `Strong Performance in ${bestSubject.name}`,
        description: `You're doing excellent in ${bestSubject.name} with ${bestSubject.accuracy}% accuracy. Keep up the good work!`,
        type: 'success',
        icon: 'bi-trophy',
        actionText: 'Practice More',
        action: () => console.log('Practice more clicked')
      });
    }

    if (worstSubject && worstSubject.accuracy < 60) {
      insights.push({
        title: `Focus on ${worstSubject.name}`,
        description: `Your accuracy in ${worstSubject.name} is ${worstSubject.accuracy}%. Consider spending more time on this subject.`,
        type: 'warning',
        icon: 'bi-exclamation-triangle',
        actionText: 'Start Practice',
        action: () => console.log('Start practice clicked')
      });
    }

    if (overallAccuracy >= 75) {
      insights.push({
        title: 'Great Overall Performance',
        description: `Your overall accuracy of ${overallAccuracy}% shows consistent improvement. You're on the right track!`,
        type: 'success',
        icon: 'bi-star',
        actionText: 'View Details',
        action: () => console.log('View details clicked')
      });
    } else if (overallAccuracy < 50) {
      insights.push({
        title: 'Need for Improvement',
        description: `Your overall accuracy of ${overallAccuracy}% indicates areas for improvement. Focus on weaker subjects.`,
        type: 'danger',
        icon: 'bi-lightbulb',
        actionText: 'Get Help',
        action: () => console.log('Get help clicked')
      });
    }

    return insights;
  }

  private getEmptyAnalytics(): AnalyticsData {
    return {
      overallAccuracy: 0,
      totalQuestions: 0,
      averageTime: 0,
      performanceLevel: 'No Data',
      accuracyTrend: [0, 0, 0, 0, 0, 0],
      questionsTrend: [0, 0, 0, 0, 0, 0],
      timeTrend: [0, 0, 0, 0, 0, 0],
      streak: 0,
      subjectPerformance: [],
      speedTrend: [0, 0, 0, 0, 0, 0],
      insights: [{
        title: 'No Data Available',
        description: 'Start taking quizzes to see your performance analytics.',
        type: 'info',
        icon: 'bi-info-circle'
      }],
      subjects: []
    };
  }
} 