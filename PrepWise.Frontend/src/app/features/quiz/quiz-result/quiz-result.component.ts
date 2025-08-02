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
            const attemptIdParam = this.route.snapshot.params['attemptId'];
            const attemptId = Number(attemptIdParam);

            if (!attemptId || isNaN(attemptId)) {
                this.toastr.error('Invalid quiz attempt ID provided', 'Error');
                this.router.navigate(['/quiz/start']);
                return;
            }

            console.log('=== LOADING QUIZ RESULT ===');
            console.log('Attempt ID:', attemptId);

            // First, try to get the result from session storage (from quiz submission)
            const storedResult = sessionStorage.getItem('quizResult');
            if (storedResult) {
                try {
                    const result = JSON.parse(storedResult);
                    console.log('✅ Found stored quiz result:', result);

                    if (result && result.success) {
                        this.quizResult = result;
                        // Clear the stored result after using it
                        sessionStorage.removeItem('quizResult');

                        setTimeout(() => {
                            this.toastr.success('Results loaded successfully!', 'Success');
                        }, 500);
                        return;
                    }
                } catch (parseError) {
                    console.error('❌ Error parsing stored result:', parseError);
                }
            }

            // Fallback: If no stored result, try to fetch from backend
            console.log('No stored result found, fetching from backend...');
            const result = await this.quizService.getQuizResult(attemptId).toPromise();

            console.log('Backend response:', result);

            if (result && result.success) {
                console.log('✅ Quiz result loaded from backend:', result);
                this.quizResult = result;

                setTimeout(() => {
                    this.toastr.success('Results loaded successfully!', 'Success');
                }, 500);
            } else {
                console.log('❌ No valid result found for attempt ID:', attemptId);
                this.toastr.error('No quiz result found for this attempt. Please try again.', 'Error');
                this.router.navigate(['/quiz/start']);
            }
        } catch (error) {
            console.error('❌ Error loading quiz result:', error);
            this.toastr.error('Failed to load quiz result. Please try again.', 'Error');
            this.router.navigate(['/quiz/start']);
        } finally {
            this.isLoading = false;
            console.log('=== END LOADING QUIZ RESULT ===');
        }
    }

    onStartNewQuiz(): void {
        // Clear any stored quiz data and navigate to quiz start
        sessionStorage.removeItem('quizResult');
        sessionStorage.removeItem('quizSubmittedAnswers');
        this.router.navigate(['/quiz/start']);
    }

    onViewAnalytics(): void {
        this.router.navigate(['/analytics']);
    }

    onShareResult(): void {
        // Implement sharing functionality
        this.toastr.info('Sharing feature coming soon!', 'Info');
    }

    onRefreshResult(): void {
        this.loadQuizResult();
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