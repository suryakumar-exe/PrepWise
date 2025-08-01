import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { LanguageService } from '../../../core/services/language.service';
import { AnalyticsData, SubjectPerformance, PerformanceTrend } from '../../../core/models/analytics.model';

@Component({
    selector: 'app-analytics',
    templateUrl: './analytics.component.html',
    styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit {
    analyticsData: AnalyticsData | null = null;
    isLoading = false;
    selectedTimeFrame: string = 'month';
    selectedSubjectId: number | null = null;
    Math = Math;

    timeFrames = [
        { value: 'week', label: 'Last Week' },
        { value: 'month', label: 'Last Month' },
        { value: 'quarter', label: 'Last 3 Months' },
        { value: 'year', label: 'Last Year' }
    ];

    constructor(
        private router: Router,
        private analyticsService: AnalyticsService,
        private toastr: ToastrService,
        public languageService: LanguageService
    ) { }

    ngOnInit(): void {
        this.loadAnalytics();
    }

    async loadAnalytics(): Promise<void> {
        this.isLoading = true;
        try {
            const data = await this.analyticsService.getAnalytics(
                this.selectedTimeFrame,
                this.selectedSubjectId
            ).toPromise();

            this.analyticsData = data || null;
        } catch (error) {
            console.error('Error loading analytics:', error);
            this.toastr.error('Failed to load analytics data');
        } finally {
            this.isLoading = false;
        }
    }

    onTimeFrameChange(): void {
        this.loadAnalytics();
    }

    onSubjectChange(): void {
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

    // Calculate trend from array (last value - first value)
    getTrendValue(trendArray: number[]): number {
        if (!trendArray || trendArray.length < 2) return 0;
        return trendArray[trendArray.length - 1] - trendArray[0];
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

    goToDashboard(): void {
        this.router.navigate(['/dashboard']);
    }

    exportAnalytics(): void {
        // Implementation for exporting analytics data
        console.log('Exporting analytics...');
        this.toastr.success('Analytics exported successfully!');
    }

    shareAnalytics(): void {
        const text = 'Check out my TNPSC preparation analytics on PrepWise!';

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
} 