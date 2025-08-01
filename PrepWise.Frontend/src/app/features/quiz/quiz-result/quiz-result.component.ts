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
            const attemptId = this.route.snapshot.params['attemptId'];

            if (!attemptId) {
                this.toastr.error('No quiz attempt ID provided', 'Error');
                this.router.navigate(['/quiz/start']);
                return;
            }

            console.log('Loading quiz result for attempt ID:', attemptId);

            // Fetch quiz result from backend using attempt ID
            const result = await this.quizService.getQuizResult(attemptId).toPromise();

            if (result) {
                console.log('Quiz result loaded from backend:', result);
                this.quizResult = result;
            } else {
                console.log('No result found for attempt ID:', attemptId);
                this.toastr.error('No quiz result found for this attempt', 'Error');
                this.router.navigate(['/quiz/start']);
            }
        } catch (error) {
            console.error('Error loading quiz result:', error);
            this.toastr.error('Failed to load quiz result', 'Error');
            this.router.navigate(['/quiz/start']);
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