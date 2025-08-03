import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MockTestService } from '../../../core/services/mock-test.service';
import { LanguageService } from '../../../core/services/language.service';
import { MockTestAttempt, MockTestResult } from '../../../core/models/mock-test.model';

@Component({
    selector: 'app-mock-test-result',
    templateUrl: './mock-test-result.component.html',
    styleUrls: ['./mock-test-result.component.css']
})
export class MockTestResultComponent implements OnInit {
    mockTest: MockTestAttempt | null = null;
    result: MockTestResult | null = null;
    answers: Map<number, number> = new Map();
    isLoading = false;

    constructor(
        private router: Router,
        private mockTestService: MockTestService,
        public languageService: LanguageService
    ) { }

    ngOnInit(): void {
        const navigation = this.router.getCurrentNavigation();
        const resultData = navigation?.extras?.state;

        if (resultData) {
            this.result = resultData['result'];
            this.mockTest = resultData['mockTest'];
            this.answers = resultData['answers'] || new Map();
        } else {
            // Redirect if no result data
            this.router.navigate(['/mock-test']);
        }
    }

    getPerformanceLevel(score: number): string {
        if (score >= 90) return 'Excellent';
        if (score >= 80) return 'Very Good';
        if (score >= 70) return 'Good';
        if (score >= 60) return 'Average';
        return 'Needs Improvement';
    }

    getPerformanceColor(score: number): string {
        if (score >= 90) return 'success';
        if (score >= 80) return 'info';
        if (score >= 70) return 'warning';
        return 'danger';
    }

    goToDashboard(): void {
        this.router.navigate(['/dashboard']);
    }

    startNewTest(): void {
        this.router.navigate(['/mock-test']);
    }

    viewDetailedAnalysis(): void {
        // Navigate to detailed analysis page
        this.router.navigate(['/analytics'], {
            state: {
                mockTestId: this.mockTest?.id,
                result: this.result
            }
        });
    }

    shareResult(): void {
        const score = this.result?.score || 0;
        if (navigator.share) {
            navigator.share({
                title: 'My TNPSC Mock Test Result',
                text: `I scored ${score}% on my TNPSC mock test!`,
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            const text = `I scored ${score}% on my TNPSC mock test!`;
            navigator.clipboard.writeText(text).then(() => {
                // Show toast notification
                console.log('Result copied to clipboard');
            });
        }
    }

    downloadCertificate(): void {
        // Implementation for downloading certificate
        console.log('Downloading certificate...');
    }

    getSubjectColor(percentage: number): string {
        if (percentage >= 80) return 'success';
        if (percentage >= 60) return 'warning';
        return 'danger';
    }
} 