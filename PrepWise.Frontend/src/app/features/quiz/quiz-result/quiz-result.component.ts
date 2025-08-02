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

            // Fetch quiz result from backend using attempt ID
            console.log('Fetching result from backend...');
            console.log('Attempt ID being sent:', attemptId);
            console.log('Attempt ID type:', typeof attemptId);

            const result = await this.quizService.getQuizResult(attemptId).toPromise();

            console.log('Backend response:', result);
            console.log('Response type:', typeof result);
            console.log('Response success:', result?.success);
            console.log('Response score:', result?.score);
            console.log('Response correctAnswers:', result?.correctAnswers);
            console.log('Response wrongAnswers:', result?.wrongAnswers);

            if (result && result.success) {
                console.log('✅ Quiz result loaded successfully:', result);
                this.quizResult = result;

                // Add a small delay before showing success message to ensure UI is ready
                setTimeout(() => {
                    this.toastr.success('Results loaded successfully!', 'Success');
                }, 500);
            } else {
                console.log('❌ No valid result found for attempt ID:', attemptId);
                console.log('Result received:', result);

                // Try one more time after a short delay
                console.log('Retrying after 3 seconds...');
                await new Promise(resolve => setTimeout(resolve, 3000));

                const retryResult = await this.quizService.getQuizResult(attemptId).toPromise();
                console.log('Retry result:', retryResult);

                if (retryResult && retryResult.success) {
                    console.log('✅ Quiz result loaded on retry:', retryResult);
                    this.quizResult = retryResult;

                    setTimeout(() => {
                        this.toastr.success('Results loaded successfully!', 'Success');
                    }, 500);
                } else {
                    this.toastr.error('No quiz result found for this attempt. Please try again.', 'Error');
                    this.router.navigate(['/quiz/start']);
                }
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
        this.router.navigate(['/quiz']);
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