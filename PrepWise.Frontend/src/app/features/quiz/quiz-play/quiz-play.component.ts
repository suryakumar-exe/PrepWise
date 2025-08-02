import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { QuizService } from '../../../core/services/quiz.service';
import { LanguageService } from '../../../core/services/language.service';
import { QuestionData } from '../../../shared/components/question-card/question-card.component';
import { QuizAnswerInput } from '../../../core/models/quiz.model';
import { TimerComponent } from '../../../shared/components/timer/timer.component';

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
    selectedDifficulty = 'MEDIUM';

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

    @ViewChild(TimerComponent) timerComponent!: TimerComponent;

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

        // Subscribe to language changes
        this.languageService.currentLanguage$.subscribe(language => {
            console.log(`🌐 Language changed to: ${language}`);
            this.updateQuestionsForLanguage(language);
        });
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

        if (!attemptId) {
            this.toastr.error('No quiz attempt ID provided');
            this.router.navigate(['/quiz/start']);
            return;
        }

        // Try to get questions from navigation state first
        const navigation = this.router.getCurrentNavigation();
        const state = navigation?.extras?.state;

        if (state && state['questions']) {
            // Use questions passed from quiz start component
            const questions = state['questions'];
            const timeLimitMinutes = state['timeLimitMinutes'] || 5;

            console.log('Using questions from navigation state:', questions.length);
            this.initializeQuizSession(questions, timeLimitMinutes, parseInt(attemptId));
        } else {
            // Fallback: Try to get from session storage
            this.loadFromSessionStorage(attemptId);
        }
    }

    private loadFromSessionStorage(attemptId: string): void {
        console.log('=== LOADING FROM SESSION STORAGE ===');

        // Try to get stored attempt details
        const storedAttemptId = sessionStorage.getItem('quizAttemptId');
        const storedSubjectId = sessionStorage.getItem('quizSubjectId');
        const storedTimeLimit = sessionStorage.getItem('quizTimeLimit');

        console.log('Stored attempt ID:', storedAttemptId);
        console.log('Stored subject ID:', storedSubjectId);
        console.log('Stored time limit:', storedTimeLimit);

        if (storedAttemptId && storedSubjectId) {
            console.log('Session storage data found, checking for stored questions');
            // Get time limit from session storage
            const timeLimitMinutes = storedTimeLimit ? parseInt(storedTimeLimit) : 5;

            // Try to get stored questions first
            const storedQuestions = sessionStorage.getItem('quizQuestions');
            if (storedQuestions) {
                try {
                    const questions = JSON.parse(storedQuestions);
                    console.log('Using stored questions:', questions.length);
                    this.initializeQuizSession(questions, timeLimitMinutes, parseInt(attemptId));
                } catch (error) {
                    console.log('Failed to parse stored questions, using sample questions');
                    const sampleQuestions = this.generateSampleQuestions(parseInt(storedSubjectId));
                    this.initializeQuizSession(sampleQuestions, timeLimitMinutes, parseInt(attemptId));
                }
            } else {
                console.log('No stored questions found, using sample questions');
                const sampleQuestions = this.generateSampleQuestions(parseInt(storedSubjectId));
                this.initializeQuizSession(sampleQuestions, timeLimitMinutes, parseInt(attemptId));
            }

            // Clear session storage after successful load
            sessionStorage.removeItem('quizAttemptId');
            sessionStorage.removeItem('quizTimeLimit');
            sessionStorage.removeItem('quizSubjectId');
            sessionStorage.removeItem('quizQuestions');
            console.log('Session storage cleared');
        } else {
            console.log('No session storage data found, redirecting to quiz start');
            this.toastr.error('No quiz data available. Please try again.');
            this.router.navigate(['/quiz/start']);
        }
        console.log('=== END SESSION STORAGE LOAD ===');
    }

    private generateSampleQuestions(subjectId: number): any[] {
        // Generate sample questions for testing when backend is not available
        return [
            {
                id: 1,
                text: "Sample question 1 for subject " + subjectId,
                difficulty: "MEDIUM",
                language: "ENGLISH",
                subjectId: subjectId,
                options: [
                    { id: 1, text: "Option A", isCorrect: true, orderIndex: 0 },
                    { id: 2, text: "Option B", isCorrect: false, orderIndex: 1 },
                    { id: 3, text: "Option C", isCorrect: false, orderIndex: 2 },
                    { id: 4, text: "Option D", isCorrect: false, orderIndex: 3 }
                ]
            },
            {
                id: 2,
                text: "Sample question 2 for subject " + subjectId,
                difficulty: "MEDIUM",
                language: "ENGLISH",
                subjectId: subjectId,
                options: [
                    { id: 5, text: "Option A", isCorrect: false, orderIndex: 0 },
                    { id: 6, text: "Option B", isCorrect: true, orderIndex: 1 },
                    { id: 7, text: "Option C", isCorrect: false, orderIndex: 2 },
                    { id: 8, text: "Option D", isCorrect: false, orderIndex: 3 }
                ]
            }
        ];
    }

    private initializeQuizSession(questions: any[], timeLimitMinutes: number, attemptId: number): void {
        console.log(`🎮 INITIALIZING QUIZ SESSION:`);
        console.log(`   Attempt ID: ${attemptId}`);
        console.log(`   Total Questions: ${questions.length}`);
        console.log(`   Time Limit: ${timeLimitMinutes} minutes`);
        console.log(`   Questions loaded:`);
        questions.forEach((question, index) => {
            console.log(`     Question ${index + 1} (ID: ${question.id}): ${question.text}`);
            console.log(`       Options:`);
            question.options.forEach((option: any) => {
                console.log(`         Option ${option.id}: ${option.text} (IsCorrect: ${option.isCorrect})`);
            });
        });
        console.log(`--- END QUIZ INITIALIZATION ---\n`);

        this.quizSession = {
            attemptId: attemptId,
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

    private updateQuestionsForLanguage(language: string): void {
        if (!this.quizSession) return;

        console.log(`🔄 Updating questions for language: ${language}`);

        // Update the language property for all questions
        this.quizSession.questions.forEach(question => {
            question.language = language.toUpperCase();
        });

        // Force change detection by creating a new array reference
        this.quizSession.questions = [...this.quizSession.questions];

        console.log('✅ Questions updated for new language');
    }

    onDifficultyChange(): void {
        if (!this.quizSession) return;

        console.log(`🔄 Updating questions for difficulty: ${this.selectedDifficulty}`);

        // Update the difficulty property for all questions
        this.quizSession.questions.forEach(question => {
            question.difficulty = this.selectedDifficulty;
        });

        // Force change detection by creating a new array reference
        this.quizSession.questions = [...this.quizSession.questions];

        // Update timer based on difficulty
        this.updateTimerForDifficulty();

        console.log('✅ Questions updated for new difficulty');
    }

    private updateTimerForDifficulty(): void {
        if (!this.quizSession) return;

        let timeMultiplier = 1;
        switch (this.selectedDifficulty) {
            case 'EASY':
                timeMultiplier = 0.8; // 20% less time
                break;
            case 'HARD':
                timeMultiplier = 1.5; // 50% more time
                break;
            default: // MEDIUM
                timeMultiplier = 1.0;
                break;
        }

        const baseTimeMinutes = 5; // Base time in minutes
        const newTimeMinutes = Math.round(baseTimeMinutes * timeMultiplier);

        this.quizSession.timeLimitSeconds = newTimeMinutes * 60;
        this.remainingTime = this.quizSession.timeLimitSeconds;

        // Reset the timer component with new time
        if (this.timerComponent) {
            this.timerComponent.reset();
        }

        console.log(`⏰ Timer updated: ${newTimeMinutes} minutes for ${this.selectedDifficulty} difficulty`);
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
            console.log(`🎯 ANSWER SELECTED:`);
            console.log(`   Question ID: ${currentQuestion.id}`);
            console.log(`   Question Text: ${currentQuestion.text}`);
            console.log(`   Selected Option ID: ${optionId}`);
            console.log(`   Selected Option Text: ${currentQuestion.options.find(opt => opt.id === optionId)?.text || 'Unknown'}`);

            // Log all options for this question
            console.log(`   All options for this question:`);
            currentQuestion.options.forEach(option => {
                console.log(`     Option ${option.id}: ${option.text} (IsCorrect: ${option.isCorrect})`);
            });

            this.quizSession.answers.set(currentQuestion.id, optionId);

            console.log(`   ✅ Answer saved for Question ${currentQuestion.id}`);
            console.log(`   Current answers map:`, Array.from(this.quizSession.answers.entries()));
            console.log(`--- END ANSWER SELECTION ---\n`);
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

        console.log(`📤 SUBMITTING QUIZ ANSWERS:`);
        console.log(`   Attempt ID: ${this.quizSession!.attemptId}`);
        console.log(`   Total answers to submit: ${answers.length}`);
        console.log(`   Answers being sent:`);
        answers.forEach(answer => {
            console.log(`     Question ${answer.questionId}: Selected Option ${answer.selectedOptionId}`);
        });
        console.log(`   Full answers array:`, answers);
        console.log(`--- END SUBMISSION DATA ---\n`);

        // Submit answers to backend using the mutation
        this.quizService.submitQuizAnswers(this.quizSession!.attemptId, answers)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => this.isSubmitting = false)
            )
            .subscribe({
                next: (result) => {
                    console.log(`📥 QUIZ SUBMISSION RESPONSE:`);
                    console.log(`   Success: ${result.success}`);
                    console.log(`   Message: ${result.message}`);
                    console.log(`   Score: ${result.score}`);
                    console.log(`   Correct Answers: ${result.correctAnswers}`);
                    console.log(`   Wrong Answers: ${result.wrongAnswers}`);
                    console.log(`   Unanswered Questions: ${result.unansweredQuestions || 0}`);
                    console.log(`   Full response:`, result);
                    console.log(`--- END RESPONSE ---\n`);

                    if (result.success) {
                        // Store the result in session storage and navigate to result page
                        sessionStorage.setItem('quizResult', JSON.stringify(result));
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