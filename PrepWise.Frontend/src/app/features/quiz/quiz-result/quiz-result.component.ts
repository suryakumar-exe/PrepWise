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
            if (attemptId) {
                this.quizResult = await this.quizService.getQuizResult(attemptId).toPromise();
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