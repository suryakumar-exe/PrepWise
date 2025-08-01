import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MockTestService } from '../../../core/services/mock-test.service';
import { LanguageService } from '../../../core/services/language.service';
import { MockTestAttempt, Question, MockTestAnswer } from '../../../core/models/mock-test.model';

@Component({
    selector: 'app-mock-test-play',
    templateUrl: './mock-test-play.component.html',
    styleUrls: ['./mock-test-play.component.css']
})
export class MockTestPlayComponent implements OnInit, OnDestroy {
    mockTest: MockTestAttempt | null = null;
    questions: Question[] = [];
    currentQuestionIndex = 0;
    answers: Map<number, number> = new Map();
    timeRemaining = 0;
    isTestComplete = false;
    isLoading = false;
    Math = Math;
    String = String;
    private timerInterval: any;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private mockTestService: MockTestService,
        private toastr: ToastrService,
        public languageService: LanguageService
    ) { }

    ngOnInit(): void {
        const navigation = this.router.getCurrentNavigation();
        const mockTestData = navigation?.extras?.state?.['mockTestData'];

        if (mockTestData) {
            this.mockTest = mockTestData;
            this.questions = mockTestData.questions || [];
            this.timeRemaining = mockTestData.timeLimitMinutes * 60;
            this.startTimer();
        } else {
            // Try to get from route params or redirect
            this.router.navigate(['/mock-test']);
        }
    }

    ngOnDestroy(): void {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }

    get currentQuestion(): Question | null {
        return this.questions[this.currentQuestionIndex] || null;
    }

    get progressPercentage(): number {
        return ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
    }

    get answeredQuestionsCount(): number {
        return this.answers.size;
    }

    get timeRemainingFormatted(): string {
        const hours = Math.floor(this.timeRemaining / 3600);
        const minutes = Math.floor((this.timeRemaining % 3600) / 60);
        const seconds = this.timeRemaining % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    startTimer(): void {
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;

            if (this.timeRemaining <= 0) {
                this.submitTest();
            } else if (this.timeRemaining <= 300) { // 5 minutes warning
                this.toastr.warning('Only 5 minutes remaining!');
            }
        }, 1000);
    }

    selectAnswer(questionId: number, optionId: number): void {
        this.answers.set(questionId, optionId);
    }

    isAnswerSelected(questionId: number, optionId: number): boolean {
        return this.answers.get(questionId) === optionId;
    }

    nextQuestion(): void {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
        }
    }

    previousQuestion(): void {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
        }
    }

    goToQuestion(index: number): void {
        if (index >= 0 && index < this.questions.length) {
            this.currentQuestionIndex = index;
        }
    }

    isQuestionAnswered(questionId: number): boolean {
        return this.answers.has(questionId);
    }

    async submitTest(): Promise<void> {
        if (this.isLoading) return;

        const confirmed = confirm('Are you sure you want to submit the test? You cannot change your answers after submission.');
        if (!confirmed) return;

        this.isLoading = true;

        try {
            const answersArray: MockTestAnswer[] = Array.from(this.answers.entries()).map(([questionId, optionId]) => ({
                questionId,
                selectedOptionId: optionId
            }));

            const result = await this.mockTestService.submitMockTest(
                this.mockTest!.id,
                answersArray
            ).toPromise();

            if (result?.success) {
                this.toastr.success('Test submitted successfully!');
                this.router.navigate(['/mock-test/result'], {
                    state: {
                        result: result,
                        mockTest: this.mockTest,
                        answers: this.answers
                    }
                });
            } else {
                this.toastr.error(result?.message || 'Failed to submit test');
            }
        } catch (error) {
            console.error('Error submitting test:', error);
            this.toastr.error('An error occurred while submitting the test');
        } finally {
            this.isLoading = false;
        }
    }

    confirmExit(): void {
        const confirmed = confirm('Are you sure you want to exit? Your progress will be lost.');
        if (confirmed) {
            this.router.navigate(['/dashboard']);
        }
    }

    getQuestionStatus(index: number): string {
        const question = this.questions[index];
        if (this.isQuestionAnswered(question.id)) {
            return 'answered';
        }
        return 'unanswered';
    }
} 