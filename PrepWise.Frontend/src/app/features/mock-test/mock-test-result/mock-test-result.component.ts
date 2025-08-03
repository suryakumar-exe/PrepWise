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
        console.log('Mock test result component initialized');

        // Try to get data from session storage
        const storedResult = sessionStorage.getItem('mockTestResult');
        const storedMockTest = sessionStorage.getItem('mockTestData');
        const storedAnswers = sessionStorage.getItem('mockTestAnswers');

        console.log('Stored result:', storedResult);
        console.log('Stored mock test:', storedMockTest);
        console.log('Stored answers:', storedAnswers);

        if (storedResult && storedMockTest) {
            try {
                this.result = JSON.parse(storedResult);
                this.mockTest = JSON.parse(storedMockTest);
                if (storedAnswers) {
                    this.answers = new Map(JSON.parse(storedAnswers));
                }

                console.log('Parsed result:', this.result);
                console.log('Parsed mock test:', this.mockTest);

                // Clear the stored data after using it
                sessionStorage.removeItem('mockTestResult');
                sessionStorage.removeItem('mockTestData');
                sessionStorage.removeItem('mockTestAnswers');
            } catch (error) {
                console.error('Error parsing stored data:', error);
                this.router.navigate(['/mock-test']);
            }
        } else {
            console.log('No result data found, redirecting to mock test start');
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