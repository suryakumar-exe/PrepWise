import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

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
    remainingTime = 0;

    // Properties for template access
    get currentQuestionIndex(): number {
        return this.quizSession?.currentQuestionIndex || 0;
    }

    get totalQuestions(): number {
        return this.quizSession?.questions.length || 0;
    }

    get questions(): QuestionData[] {
        return this.quizSession?.questions || [];
    }

    get answeredQuestions(): number {
        return this.getAnsweredQuestionsCount();
    }

    get currentQuiz(): any {
        return {
            title: 'Quiz Session',
            timeLimit: this.quizSession?.timeLimitSeconds || 1200
        };
    }

    get timeLimit(): number {
        return this.quizSession?.timeLimitSeconds || 1200;
    }

    get currentQuestion(): QuestionData | null {
        return this.getCurrentQuestion();
    }

    get selectedAnswer(): number | null {
        if (!this.currentQuestion) return null;
        return this.getSelectedOptionId(this.currentQuestion.id);
    }

    get progressPercentage(): number {
        return this.getProgressPercentage();
    }

    private destroy$ = new Subject<void>();
    private autoSaveInterval: any;
    private timerInterval: any;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private quizService: QuizService,
        public languageService: LanguageService,
        private toastr: ToastrService
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
        this.startTimer();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();

        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }

    private loadQuizSession(): void {
        const attemptId = this.route.snapshot.params['attemptId'];
        console.log('Loading quiz session for attempt ID:', attemptId); // Debug log

        // Try to get questions from navigation state first
        const navigation = this.router.getCurrentNavigation();
        const state = navigation?.extras?.state;
        console.log('Navigation state:', state); // Debug log

        if (state && state['questions']) {
            // Use questions passed from quiz start component
            const questions = state['questions'];
            const timeLimitMinutes = state['timeLimitMinutes'] || 20;
            const subjectId = state['subjectId'];

            console.log('Using questions from navigation state:', questions); // Debug log

            this.quizSession = {
                attemptId: parseInt(attemptId) || 1,
                questions: questions,
                currentQuestionIndex: 0,
                answers: new Map(),
                flaggedQuestions: new Set(),
                startTime: new Date(),
                timeLimitSeconds: timeLimitMinutes * 60,
                isSubmitted: false
            };
            this.remainingTime = this.quizSession.timeLimitSeconds;
            this.isLoading = false;
        } else if (attemptId) {
            // Fallback: Load quiz attempt details from backend
            console.log('No questions in state, trying to load from backend...'); // Debug log
            this.quizService.getQuizAttempt(attemptId).subscribe({
                next: (attempt: any) => {
                    console.log('Backend attempt response:', attempt); // Debug log
                    if (attempt) {
                        this.quizSession = {
                            attemptId: attempt.id,
                            questions: attempt.questions || [],
                            currentQuestionIndex: 0,
                            answers: new Map(),
                            flaggedQuestions: new Set(),
                            startTime: new Date(),
                            timeLimitSeconds: attempt.timeLimitMinutes * 60,
                            isSubmitted: false
                        };
                        this.remainingTime = this.quizSession.timeLimitSeconds;
                        this.isLoading = false;
                    } else {
                        console.log('No attempt data from backend, using mock questions'); // Debug log
                        this.loadMockQuizSession(attemptId);
                    }
                },
                error: (error: any) => {
                    console.error('Error loading quiz session from backend:', error);
                    console.log('Falling back to mock questions'); // Debug log
                    this.loadMockQuizSession(attemptId);
                }
            });
        } else {
            // Fallback to mock data
            console.log('No attempt ID, using mock questions'); // Debug log
            this.loadMockQuizSession(1);
        }
    }

    private loadMockQuizSession(attemptId: number): void {
        this.quizSession = {
            attemptId: attemptId,
            questions: this.getMockQuestions(),
            currentQuestionIndex: 0,
            answers: new Map(),
            flaggedQuestions: new Set(),
            startTime: new Date(),
            timeLimitSeconds: 1200, // 20 minutes
            isSubmitted: false
        };
        this.remainingTime = this.quizSession.timeLimitSeconds;
        this.isLoading = false;
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

    private startTimer(): void {
        this.timerInterval = setInterval(() => {
            if (this.quizSession && !this.quizSession.isSubmitted && this.remainingTime > 0) {
                this.remainingTime--;
                if (this.remainingTime <= 0) {
                    this.onTimeUp();
                }
            }
        }, 1000);
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

    // Template methods
    nextQuestion(): void {
        this.goToNextQuestion();
    }

    goToQuestion(index: number): void {
        this.navigateToQuestion(index);
    }

    previousQuestion(): void {
        this.goToPreviousQuestion();
    }

    getQuestionNumberClass(index: number): string {
        const status = this.getQuestionStatus(index);
        return `question-number ${status}`;
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

    submitQuiz(): void {
        if (!this.quizSession || this.isSubmitting) return;

        this.isSubmitting = true;
        this.quizSession.isSubmitted = true;

        const answers: any[] = Array.from(this.quizSession.answers.entries()).map(([questionId, optionId]) => ({
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
                    } else {
                        this.toastr.error(result.message || 'Failed to submit quiz');
                        this.quizSession!.isSubmitted = false;
                    }
                },
                error: (error) => {
                    console.error('Error submitting quiz:', error);
                    this.toastr.error('An error occurred while submitting the quiz');
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