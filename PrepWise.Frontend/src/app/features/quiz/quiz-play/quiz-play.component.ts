import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { QuizService } from '../../../core/services/quiz.service';
import { LanguageService } from '../../../core/services/language.service';
import { QuestionData } from '../../../shared/components/question-card/question-card.component';
import { QuizAnswerInput } from '../../../core/models/quiz.model';

interface QuizSession {
    attemptId: number;
    questions: QuestionData[];
    currentQuestionIndex: number;
    answers: Map<number, number>;
    flaggedQuestions: Set<number>;
    startTime: Date;
    timeLimitSeconds: number;
    isSubmitted: boolean;
}

@Component({
    selector: 'app-quiz-play',
    templateUrl: './quiz-play.component.html',
    styleUrls: ['./quiz-play.component.css']
})
export class QuizPlayComponent implements OnInit, OnDestroy {
    quizSession: QuizSession | null = null;
    isLoading = true;
    isSubmitting = false;
    showConfirmSubmit = false;

    private destroy$ = new Subject<void>();
    private autoSaveInterval: any;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private quizService: QuizService,
        public languageService: LanguageService
    ) { }

    @HostListener('window:beforeunload', ['$event'])
    unloadNotification($event: any): void {
        if (this.quizSession && !this.quizSession.isSubmitted) {
            $event.returnValue = 'You have an active quiz. Are you sure you want to leave?';
        }
    }

    ngOnInit(): void {
        this.loadQuizSession();
        this.setupAutoSave();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();

        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
    }

    private loadQuizSession(): void {
        const attemptId = this.route.snapshot.params['attemptId'];
        if (!attemptId) {
            this.router.navigate(['/quiz']);
            return;
        }

        this.isLoading = true;

        // Mock quiz session data (in real app, this would come from the API)
        setTimeout(() => {
            this.quizSession = {
                attemptId: parseInt(attemptId),
                questions: this.getMockQuestions(),
                currentQuestionIndex: 0,
                answers: new Map(),
                flaggedQuestions: new Set(),
                startTime: new Date(),
                timeLimitSeconds: 1200, // 20 minutes
                isSubmitted: false
            };
            this.isLoading = false;
        }, 1000);
    }

    private getMockQuestions(): QuestionData[] {
        return [
            {
                id: 1,
                text: 'What is the capital of Tamil Nadu?',
                difficulty: 'Easy',
                language: 'English',
                subjectId: 1,
                options: [
                    { id: 1, text: 'Chennai', isCorrect: true, orderIndex: 0 },
                    { id: 2, text: 'Coimbatore', isCorrect: false, orderIndex: 1 },
                    { id: 3, text: 'Madurai', isCorrect: false, orderIndex: 2 },
                    { id: 4, text: 'Trichy', isCorrect: false, orderIndex: 3 }
                ]
            },
            {
                id: 2,
                text: 'Which of the following is the correct grammar rule for Tamil?',
                difficulty: 'Medium',
                language: 'English',
                subjectId: 2,
                explanation: 'Tamil grammar follows specific rules for sentence structure.',
                options: [
                    { id: 5, text: 'Subject + Verb + Object', isCorrect: false, orderIndex: 0 },
                    { id: 6, text: 'Subject + Object + Verb', isCorrect: true, orderIndex: 1 },
                    { id: 7, text: 'Verb + Subject + Object', isCorrect: false, orderIndex: 2 },
                    { id: 8, text: 'Object + Verb + Subject', isCorrect: false, orderIndex: 3 }
                ]
            }
            // Add more mock questions as needed
        ];
    }

    private setupAutoSave(): void {
        // Auto-save answers every 30 seconds
        this.autoSaveInterval = setInterval(() => {
            if (this.quizSession && !this.quizSession.isSubmitted) {
                this.saveProgress();
            }
        }, 30000);
    }

    private saveProgress(): void {
        // Save current progress to backend
        console.log('Auto-saving progress...');
    }

    getCurrentQuestion(): QuestionData | null {
        if (!this.quizSession || this.quizSession.questions.length === 0) {
            return null;
        }
        return this.quizSession.questions[this.quizSession.currentQuestionIndex];
    }

    onAnswerSelected(optionId: number): void {
        if (!this.quizSession) return;

        const currentQuestion = this.getCurrentQuestion();
        if (currentQuestion) {
            this.quizSession.answers.set(currentQuestion.id, optionId);
        }
    }

    onQuestionFlagged(questionId: number): void {
        if (!this.quizSession) return;

        if (this.quizSession.flaggedQuestions.has(questionId)) {
            this.quizSession.flaggedQuestions.delete(questionId);
        } else {
            this.quizSession.flaggedQuestions.add(questionId);
        }
    }

    navigateToQuestion(index: number): void {
        if (!this.quizSession || index < 0 || index >= this.quizSession.questions.length) {
            return;
        }
        this.quizSession.currentQuestionIndex = index;
    }

    goToPreviousQuestion(): void {
        if (this.quizSession && this.quizSession.currentQuestionIndex > 0) {
            this.quizSession.currentQuestionIndex--;
        }
    }

    goToNextQuestion(): void {
        if (this.quizSession && this.quizSession.currentQuestionIndex < this.quizSession.questions.length - 1) {
            this.quizSession.currentQuestionIndex++;
        }
    }

    onTimeUp(): void {
        this.submitQuiz();
    }

    onSubmitQuiz(): void {
        this.showConfirmSubmit = true;
    }

    confirmSubmitQuiz(): void {
        this.showConfirmSubmit = false;
        this.submitQuiz();
    }

    cancelSubmitQuiz(): void {
        this.showConfirmSubmit = false;
    }

    private submitQuiz(): void {
        if (!this.quizSession || this.isSubmitting) return;

        this.isSubmitting = true;
        this.quizSession.isSubmitted = true;

        const answers: QuizAnswerInput[] = Array.from(this.quizSession.answers.entries()).map(([questionId, optionId]) => ({
            questionId,
            selectedOptionId: optionId
        }));

        this.quizService.submitQuizAnswers(this.quizSession.attemptId, answers)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => this.isSubmitting = false)
            )
            .subscribe({
                next: (result) => {
                    if (result.success) {
                        this.router.navigate(['/quiz/result', this.quizSession!.attemptId]);
                    }
                },
                error: (error) => {
                    console.error('Error submitting quiz:', error);
                    this.quizSession!.isSubmitted = false;
                }
            });
    }

    getSelectedOptionId(questionId: number): number | null {
        return this.quizSession?.answers.get(questionId) || null;
    }

    isQuestionAnswered(questionId: number): boolean {
        return this.quizSession?.answers.has(questionId) || false;
    }

    isQuestionFlagged(questionId: number): boolean {
        return this.quizSession?.flaggedQuestions.has(questionId) || false;
    }

    getAnsweredQuestionsCount(): number {
        return this.quizSession?.answers.size || 0;
    }

    getUnansweredQuestionsCount(): number {
        if (!this.quizSession) return 0;
        return this.quizSession.questions.length - this.getAnsweredQuestionsCount();
    }

    getFlaggedQuestionsCount(): number {
        return this.quizSession?.flaggedQuestions.size || 0;
    }

    getProgressPercentage(): number {
        if (!this.quizSession) return 0;
        return Math.round((this.getAnsweredQuestionsCount() / this.quizSession.questions.length) * 100);
    }

    getQuestionStatus(questionIndex: number): string {
        if (!this.quizSession) return '';

        const question = this.quizSession.questions[questionIndex];
        const isAnswered = this.isQuestionAnswered(question.id);
        const isFlagged = this.isQuestionFlagged(question.id);
        const isCurrent = questionIndex === this.quizSession.currentQuestionIndex;

        if (isCurrent) return 'current';
        if (isFlagged && isAnswered) return 'flagged-answered';
        if (isFlagged) return 'flagged';
        if (isAnswered) return 'answered';
        return 'unanswered';
    }
} 