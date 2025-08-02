import { Component, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { Subject, takeUntil, filter, finalize } from 'rxjs';
import { QuizService } from '../../../core/services/quiz.service';
import { LanguageService } from '../../../core/services/language.service';
import { ToastrService } from 'ngx-toastr';
import { QuestionCardComponent } from '../../../shared/components/question-card/question-card.component';
import { TimerComponent } from '../../../shared/components/timer/timer.component';
import { Question, QuizAnswerInput } from '../../../core/models/quiz.model';

interface QuizSession {
    attemptId: number;
    questions: Question[];
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
    @ViewChild(QuestionCardComponent) questionCard!: QuestionCardComponent;
    @ViewChild(TimerComponent) timer!: TimerComponent;

    quizSession: QuizSession | null = null;
    isLoading = true;
    isSubmitting = false;
    showConfirmSubmit = false;
    remainingTime = 0;
    autoSaveInterval: any;
    timerInterval: any;
    private destroy$ = new Subject<void>();
    private navigationAttempted = false;

    // Properties for template access
    get currentQuestionIndex(): number {
        return this.quizSession?.currentQuestionIndex || 0;
    }

    get totalQuestions(): number {
        return this.quizSession?.questions.length || 0;
    }

    get questions(): Question[] {
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

    get currentQuestion(): Question | null {
        return this.getCurrentQuestion();
    }

    get selectedAnswer(): number | null {
        if (!this.currentQuestion) return null;
        return this.getSelectedOptionId(this.currentQuestion.id);
    }

    get progressPercentage(): number {
        return this.getProgressPercentage();
    }

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private quizService: QuizService,
        public languageService: LanguageService,
        private toastr: ToastrService
    ) {
        // Listen for navigation attempts
        this.router.events.pipe(
            takeUntil(this.destroy$),
            filter(event => event instanceof NavigationStart)
        ).subscribe((event: NavigationStart) => {
            if (this.quizSession && !this.quizSession.isSubmitted && !this.navigationAttempted) {
                this.navigationAttempted = true;
                this.handleNavigationAway();
            }
        });
    }

    @HostListener('window:beforeunload', ['$event'])
    onBeforeUnload(event: BeforeUnloadEvent): void {
        if (this.quizSession && !this.quizSession.isSubmitted) {
            event.preventDefault();
            event.returnValue = 'You have an active quiz session. Are you sure you want to leave?';
            this.clearSessionStorage();
        }
    }

    @HostListener('window:popstate', ['$event'])
    onPopState(event: PopStateEvent): void {
        if (this.quizSession && !this.quizSession.isSubmitted) {
            this.handleNavigationAway();
        }
    }

    private handleNavigationAway(): void {
        console.log('⚠️ User attempting to navigate away during active quiz');

        // Show warning toast
        this.toastr.warning('Quiz session will be lost if you leave this page', 'Warning', {
            timeOut: 5000,
            closeButton: true
        });

        // Clear session storage
        this.clearSessionStorage();

        // Reset navigation flag after a delay
        setTimeout(() => {
            this.navigationAttempted = false;
        }, 1000);
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

        // Clear session storage if quiz was not submitted
        if (this.quizSession && !this.quizSession.isSubmitted) {
            console.log('Quiz not submitted, clearing session storage on destroy');
            this.clearSessionStorage();
        }
    }

    private loadQuizSession(): void {
        console.log('=== LOADING QUIZ SESSION ===');

        // Get attempt ID from route
        const attemptId = this.route.snapshot.paramMap.get('attemptId');
        console.log('Attempt ID from route:', attemptId);

        if (attemptId) {
            // Try to load from session storage first
            this.loadFromSessionStorage(attemptId);
        } else {
            // Try to get from navigation state
            const navigation = this.router.getCurrentNavigation();
            console.log('Navigation state:', navigation?.extras?.state);

            if (navigation?.extras?.state) {
                const state = navigation.extras.state as any;
                console.log('State data:', state);

                if (state.attemptId && state.questions) {
                    console.log('Loading from navigation state');
                    this.initializeQuizSession(state.questions, state.timeLimitMinutes || 30, state.attemptId);
                } else {
                    console.error('❌ Missing required data in navigation state');
                    this.toastr.error('Failed to load quiz session', 'Error');
                    this.router.navigate(['/quiz/start']);
                }
            } else {
                console.error('❌ No attempt ID or navigation state found');
                this.toastr.error('Failed to load quiz session', 'Error');
                this.router.navigate(['/quiz/start']);
            }
        }
    }

    private loadFromSessionStorage(attemptId: string): void {
        console.log('=== LOADING FROM SESSION STORAGE ===');

        // Try to get stored attempt details
        const storedAttemptId = sessionStorage.getItem('quizAttemptId');
        const storedSubjectId = sessionStorage.getItem('quizSubjectId');
        const storedTimeLimit = sessionStorage.getItem('quizTimeLimit');
        const storedQuestionCount = sessionStorage.getItem('quizQuestionCount');
        const storedQuestions = sessionStorage.getItem('quizQuestions');

        console.log('Stored attempt ID:', storedAttemptId);
        console.log('Stored subject ID:', storedSubjectId);
        console.log('Stored time limit:', storedTimeLimit);
        console.log('Stored question count:', storedQuestionCount);
        console.log('Stored questions:', storedQuestions ? 'Found' : 'Not found');

        if (storedAttemptId && storedQuestions && storedAttemptId === attemptId) {
            try {
                const questions = JSON.parse(storedQuestions);
                const timeLimit = parseInt(storedTimeLimit || '30');

                console.log('Parsed questions:', questions);
                console.log('Questions length:', questions?.length);

                if (questions && Array.isArray(questions) && questions.length > 0) {
                    console.log('✅ Successfully loaded questions from session storage');
                    this.initializeQuizSession(questions, timeLimit, parseInt(attemptId));
                } else {
                    console.warn('⚠️ Questions array is empty or invalid, trying to reload from backend');
                    this.reloadQuestionsFromBackend(parseInt(storedSubjectId || '0'), parseInt(storedQuestionCount || '5'), timeLimit, parseInt(attemptId));
                }
            } catch (error) {
                console.error('❌ Error parsing stored questions:', error);
                this.reloadQuestionsFromBackend(parseInt(storedSubjectId || '0'), parseInt(storedQuestionCount || '5'), parseInt(storedTimeLimit || '30'), parseInt(attemptId));
            }
        } else {
            console.warn('⚠️ No valid session storage data found, redirecting to quiz start');
            this.toastr.error('Quiz session expired. Please start a new quiz.', 'Session Expired');
            this.router.navigate(['/quiz/start']);
        }
    }

    private reloadQuestionsFromBackend(subjectId: number, questionCount: number, timeLimit: number, attemptId: number): void {
        console.log('=== RELOADING QUESTIONS FROM BACKEND ===');
        console.log('Subject ID:', subjectId);
        console.log('Question Count:', questionCount);
        console.log('Time Limit:', timeLimit);
        console.log('Attempt ID:', attemptId);

        if (!subjectId || subjectId === 0) {
            console.error('❌ Invalid subject ID for reload');
            this.toastr.error('Invalid subject. Please start a new quiz.', 'Error');
            this.router.navigate(['/quiz/start']);
            return;
        }

        // Get current user ID from session storage or auth service
        const currentUser = sessionStorage.getItem('currentUser');
        const userId = currentUser ? JSON.parse(currentUser).id : 1; // Fallback to 1 if not found

        console.log('User ID for reload:', userId);

        this.quizService.startQuizAttempt(userId, subjectId, questionCount, timeLimit)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => {
                    this.isLoading = false;
                })
            )
            .subscribe({
                next: (result) => {
                    console.log('Backend reload result:', result);

                    if (result.success && result.questions && result.questions.length > 0) {
                        console.log('✅ Successfully reloaded questions from backend');
                        console.log('Questions count:', result.questions.length);

                        // Update session storage with new data
                        sessionStorage.setItem('quizQuestions', JSON.stringify(result.questions));
                        sessionStorage.setItem('quizAttemptId', attemptId.toString());
                        sessionStorage.setItem('quizSubjectId', subjectId.toString());
                        sessionStorage.setItem('quizTimeLimit', timeLimit.toString());
                        sessionStorage.setItem('quizQuestionCount', questionCount.toString());

                        this.initializeQuizSession(result.questions, timeLimit, attemptId);
                    } else {
                        console.error('❌ Failed to reload questions from backend');
                        console.error('Success:', result.success);
                        console.error('Questions:', result.questions);
                        console.error('Message:', result.message);

                        this.toastr.error(`Failed to load questions: ${result.message || 'Unknown error'}`, 'Error');
                        this.router.navigate(['/quiz/start']);
                    }
                },
                error: (error) => {
                    console.error('❌ Error reloading questions from backend:', error);
                    this.toastr.error('Failed to reload questions. Please try again.', 'Error');
                    this.router.navigate(['/quiz/start']);
                }
            });
    }

    private generateSampleQuestions(subjectId: number, questionCount: number = 5): any[] {
        console.log(`🔧 Generating ${questionCount} sample questions for subject ${subjectId}`);

        // Generate sample questions for testing when backend is not available
        const questions = [];

        for (let i = 1; i <= questionCount; i++) {
            questions.push({
                id: i,
                text: `Sample question ${i} for subject ${subjectId}`,
                textTamil: `பாடம் ${subjectId} க்கான மாதிரி கேள்வி ${i}`,
                difficulty: "MEDIUM",
                language: "ENGLISH",
                subjectId: subjectId,
                options: [
                    { id: (i * 4) - 3, text: "Option A", textTamil: "விருப்பம் அ", isCorrect: i % 4 === 1, orderIndex: 0 },
                    { id: (i * 4) - 2, text: "Option B", textTamil: "விருப்பம் ஆ", isCorrect: i % 4 === 2, orderIndex: 1 },
                    { id: (i * 4) - 1, text: "Option C", textTamil: "விருப்பம் இ", isCorrect: i % 4 === 3, orderIndex: 2 },
                    { id: (i * 4), text: "Option D", textTamil: "விருப்பம் ஈ", isCorrect: i % 4 === 0, orderIndex: 3 }
                ]
            });
        }

        console.log(`✅ Generated ${questions.length} sample questions`);
        return questions;
    }

    private clearSessionStorage(): void {
        console.log('Clearing session storage...');
        sessionStorage.removeItem('quizAttemptId');
        sessionStorage.removeItem('quizTimeLimit');
        sessionStorage.removeItem('quizSubjectId');
        sessionStorage.removeItem('quizQuestions');
        sessionStorage.removeItem('quizQuestionCount');
        console.log('Session storage cleared');
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

        console.log(`🔄 Language changed to: ${language}`);

        // Force change detection by creating a new array reference
        // This will trigger the question card components to re-render with new language
        this.quizSession.questions = [...this.quizSession.questions];

        console.log('✅ Questions updated for new language');
    }



    getCurrentQuestion(): Question | null {
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

        const answers: QuizAnswerInput[] = Array.from(this.quizSession.answers.entries()).map(([questionId, optionId]) => ({
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
                next: (result: any) => {
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
                        // Clear session storage after successful submission
                        this.clearSessionStorage();

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