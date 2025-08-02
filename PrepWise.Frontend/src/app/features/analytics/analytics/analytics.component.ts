import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { LanguageService } from '../../../core/services/language.service';
import { AuthService } from '../../../core/services/auth.service';
import { AnalyticsData, SubjectPerformance, PerformanceTrend } from '../../../core/models/analytics.model';

@Component({
    selector: 'app-analytics',
    templateUrl: './analytics.component.html',
    styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit, OnDestroy {
    analyticsData: AnalyticsData | null = null;
    isLoading = false;
    selectedTimeFrame: string = 'month';
    selectedSubjectId: number | null = null;
    Math = Math;
    currentUser: any = null;

    timeFrames = [
        { value: 'week', label: 'Last Week' },
        { value: 'month', label: 'Last Month' },
        { value: 'quarter', label: 'Last 3 Months' },
        { value: 'year', label: 'Last Year' }
    ];

    private destroy$ = new Subject<void>();

    constructor(
        private router: Router,
        private analyticsService: AnalyticsService,
        private authService: AuthService,
        private toastr: ToastrService,
        public languageService: LanguageService
    ) { }

    ngOnInit(): void {
        this.loadCurrentUser();
        this.loadAnalytics();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private loadCurrentUser(): void {
        this.authService.currentUser$
            .pipe(takeUntil(this.destroy$))
            .subscribe(user => {
                this.currentUser = user;
                if (!user) {
                    this.toastr.error('Please login to view analytics');
                    this.router.navigate(['/login']);
                }
            });
    }

    async loadAnalytics(): Promise<void> {
        if (!this.currentUser) {
            return;
        }

        this.isLoading = true;
        try {
            console.log('Loading analytics for user:', this.currentUser.id);
            console.log('Selected subject ID:', this.selectedSubjectId);

            const data = await this.analyticsService.getAnalytics(
                this.selectedTimeFrame,
                this.selectedSubjectId
            ).toPromise();

            this.analyticsData = data || null;

            console.log('Analytics data loaded:', this.analyticsData);

            if (data && data.totalQuestions === 0) {
                this.toastr.info('No quiz data available. Start taking quizzes to see your analytics!');
            }
        } catch (error) {
            console.error('Error loading analytics:', error);
            this.toastr.error('Failed to load analytics data');
            this.analyticsData = null;
        } finally {
            this.isLoading = false;
        }
    }

    onTimeFrameChange(): void {
        this.loadAnalytics();
    }

    onSubjectChange(): void {
        console.log('=== SUBJECT CHANGE ===');
        console.log('Selected Subject ID (before conversion):', this.selectedSubjectId, 'Type:', typeof this.selectedSubjectId);

        // Convert string to number if it's not null
        if (this.selectedSubjectId !== null && this.selectedSubjectId !== undefined) {
            this.selectedSubjectId = Number(this.selectedSubjectId);
        }

        console.log('Selected Subject ID (after conversion):', this.selectedSubjectId, 'Type:', typeof this.selectedSubjectId);
        console.log('Available Subjects:', this.analyticsData?.subjects);
        this.loadAnalytics();
    }

    getPerformanceColor(percentage: number): string {
        if (percentage >= 80) return 'success';
        if (percentage >= 60) return 'warning';
        return 'danger';
    }

    getPerformanceLevel(percentage: number): string {
        if (percentage >= 90) return 'Excellent';
        if (percentage >= 80) return 'Very Good';
        if (percentage >= 70) return 'Good';
        if (percentage >= 60) return 'Average';
        if (percentage >= 50) return 'Below Average';
        return 'Needs Improvement';
    }

    getPerformanceLevelScore(percentage: number): number {
        if (percentage >= 90) return 95;
        if (percentage >= 80) return 85;
        if (percentage >= 70) return 75;
        if (percentage >= 60) return 65;
        if (percentage >= 50) return 55;
        return 45;
    }

    // Calculate trend from array (last value - first value)
    getTrendValue(trendArray: number[]): number {
        if (!trendArray || trendArray.length < 2) return 0;
        const change = trendArray[trendArray.length - 1] - trendArray[0];
        return Math.round(change * 10) / 10;
    }

    getTrendIcon(trendArray: number[]): string {
        const trend = this.getTrendValue(trendArray);
        if (trend > 0) return 'bi-arrow-up';
        if (trend < 0) return 'bi-arrow-down';
        return 'bi-dash';
    }

    getTrendColor(trendArray: number[]): string {
        const trend = this.getTrendValue(trendArray);
        if (trend > 0) return 'text-success';
        if (trend < 0) return 'text-danger';
        return 'text-muted';
    }

    getTrendPercentage(trendArray: number[]): number {
        if (!trendArray || trendArray.length < 2) return 0;
        const firstValue = trendArray[0];
        const lastValue = trendArray[trendArray.length - 1];
        if (firstValue === 0) return 0;
        return Math.round(((lastValue - firstValue) / firstValue) * 100);
    }

    goToDashboard(): void {
        this.router.navigate(['/dashboard']);
    }

    exportAnalytics(): void {
        if (!this.analyticsData) {
            this.toastr.warning('No data to export');
            return;
        }

        // Create CSV content
        const csvContent = this.generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `analytics_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);

        this.toastr.success('Analytics exported successfully!');
    }

    private generateCSV(): string {
        if (!this.analyticsData) return '';

        const headers = ['Metric', 'Value'];
        const rows = [
            ['Overall Accuracy', `${this.analyticsData.overallAccuracy}%`],
            ['Total Questions', this.analyticsData.totalQuestions.toString()],
            ['Average Time per Question', `${this.analyticsData.averageTime} min`],
            ['Performance Level', this.analyticsData.performanceLevel],
            ['Study Streak', `${this.analyticsData.streak} days`]
        ];

        // Add subject performance
        rows.push(['', '']);
        rows.push(['Subject Performance', '']);
        this.analyticsData.subjectPerformance.forEach(subject => {
            rows.push([subject.name, `${subject.accuracy}%`]);
        });

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    shareAnalytics(): void {
        if (!this.analyticsData) {
            this.toastr.warning('No data to share');
            return;
        }

        const text = `Check out my TNPSC preparation analytics on PrepWise! Overall Accuracy: ${this.analyticsData.overallAccuracy}%, Questions Attempted: ${this.analyticsData.totalQuestions}`;

        if (navigator.share) {
            navigator.share({
                title: 'My PrepWise Analytics',
                text: text,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(text).then(() => {
                this.toastr.success('Analytics link copied to clipboard!');
            });
        }
    }

    startQuizForSubject(subjectId: number): void {
        this.router.navigate(['/quiz/start'], {
            queryParams: { subject: subjectId }
        });
    }

    getSubjectDropdownLabel(): string {
        if (this.selectedSubjectId === null) {
            return 'All Subjects';
        }
        const subject = this.analyticsData?.subjects.find(s => s.id === this.selectedSubjectId);
        return subject ? subject.name : 'All Subjects';
    }

    hasData(): boolean {
        return this.analyticsData !== null && this.analyticsData.totalQuestions > 0;
    }
} 