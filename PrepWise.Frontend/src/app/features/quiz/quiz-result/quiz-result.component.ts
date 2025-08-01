import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from '../../../core/services/quiz.service';
import { QuizAttempt, QuizResult } from '../../../core/models/quiz.model';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-quiz-result',
    templateUrl: './quiz-result.component.html',
    styleUrls: ['./quiz-result.component.css']
})
export class QuizResultComponent implements OnInit {
    quizResult: QuizResult | null = null;
    isLoading = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private quizService: QuizService,
        private toastr: ToastrService
    ) { }

    ngOnInit(): void {
        this.loadQuizResult();
    }

    async loadQuizResult(): Promise<void> {
        this.isLoading = true;
        try {
            // Try to get result from navigation state first
            const navigation = this.router.getCurrentNavigation();
            const state = navigation?.extras?.state;

            if (state && state['quizResult']) {
                // Use result passed from quiz play component
                this.quizResult = state['quizResult'];
            } else {
                // Fallback: Try to get from session storage
                const storedResult = sessionStorage.getItem('quizResult');
                if (storedResult) {
                    this.quizResult = JSON.parse(storedResult);
                    sessionStorage.removeItem('quizResult');
                } else {
                    // Final fallback: Try backend
                    const attemptId = this.route.snapshot.params['attemptId'];
                    if (attemptId) {
                        const result = await this.quizService.getQuizResult(attemptId).toPromise();
                        this.quizResult = result || null;
                    }
                }
            }
        } catch (error) {
            this.toastr.error('Failed to load quiz result', 'Error');
            console.error('Error loading quiz result:', error);
        } finally {
            this.isLoading = false;
        }
    }

    onStartNewQuiz(): void {
        this.router.navigate(['/quiz']);
    }

    onViewAnalytics(): void {
        this.router.navigate(['/analytics']);
    }

    onShareResult(): void {
        // Implement sharing functionality
        this.toastr.info('Sharing feature coming soon!', 'Info');
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
} 