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
        public router: Router,
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

        // Clear session storage if quiz was not submitted
        if (this.quizSession && !this.quizSession.isSubmitted) {
            console.log('Quiz not submitted, clearing session storage on destroy');
            this.clearSessionStorage();
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

        console.log('=== LOADING QUIZ SESSION ===');
        console.log('Attempt ID:', attemptId);
        console.log('Navigation state:', state);

        if (state && state['questions']) {
            // Use questions passed from quiz start component
            const questions = state['questions'];
            const timeLimitMinutes = state['timeLimitMinutes'] || 5;
            const questionCount = state['questionCount'] || questions.length;

            console.log('Using questions from navigation state:', questions.length);
            console.log('Question count from state:', questionCount);
            console.log('Time limit from state:', timeLimitMinutes);

            this.initializeQuizSession(questions, timeLimitMinutes, parseInt(attemptId));
        } else {
            // Fallback: Try to get from session storage
            console.log('No navigation state found, using session storage');
            this.loadFromSessionStorage(attemptId);
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
                    console.log(`📊 Question count: ${questions.length} (expected: ${storedQuestionCount})`);

                    // Use the actual number of questions found, not the stored count
                    const actualQuestionCount = questions.length;
                    sessionStorage.setItem('quizQuestionCount', actualQuestionCount.toString());

                    this.initializeQuizSession(questions, timeLimit, parseInt(attemptId));
                } else {
                    console.warn('⚠️ Questions array is empty or invalid, generating sample questions');
                    this.generateAndUseSampleQuestions(attemptId, storedSubjectId, storedTimeLimit);
                }
            } catch (error) {
                console.error('❌ Error parsing stored questions:', error);
                console.warn('⚠️ Generating sample questions as fallback');
                this.generateAndUseSampleQuestions(attemptId, storedSubjectId, storedTimeLimit);
            }
        } else {
            console.warn('⚠️ No valid session storage data found, generating sample questions');
            this.generateAndUseSampleQuestions(attemptId, null, '30');
        }
    }

    private generateAndUseSampleQuestions(attemptId: string, subjectId: string | null, timeLimit: string | null): void {
        console.log('=== GENERATING SAMPLE QUESTIONS ===');
        const subjectIdNum = subjectId ? parseInt(subjectId) : 1;
        const timeLimitNum = timeLimit ? parseInt(timeLimit) : 30;
        const questionCount = 2; // Default to 2 questions for testing

        console.log(`Generating ${questionCount} sample questions for subject ${subjectIdNum}`);

        const sampleQuestions = this.generateSampleQuestions(subjectIdNum, questionCount);

        if (sampleQuestions && sampleQuestions.length > 0) {
            console.log('✅ Sample questions generated successfully');
            this.initializeQuizSession(sampleQuestions, timeLimitNum, parseInt(attemptId));
        } else {
            console.error('❌ Failed to generate sample questions');
            this.toastr.error('Failed to load quiz data. Please start a new quiz.', 'Error');
            this.router.navigate(['/quiz/start']);
        }
    }

    private generateSampleQuestions(subjectId: number, questionCount: number = 5): any[] {
        console.log(`🔧 Generating ${questionCount} sample questions for subject ${subjectId}`);

        // Generate sample questions for testing when backend is not available
        const questions = [];

        for (let i = 1; i <= questionCount; i++) {
            const question = {
                id: i,
                text: `Sample question ${i} for subject ${subjectId}?`,
                textTamil: `பாடம் ${subjectId} க்கான மாதிரி கேள்வி ${i}?`,
                difficulty: "MEDIUM",
                language: "ENGLISH",
                subjectId: subjectId,
                options: [
                    { id: (i * 4) - 3, text: `Option A for question ${i}`, textTamil: `கேள்வி ${i} க்கான விருப்பம் அ`, isCorrect: i % 4 === 1, orderIndex: 0 },
                    { id: (i * 4) - 2, text: `Option B for question ${i}`, textTamil: `கேள்வி ${i} க்கான விருப்பம் ஆ`, isCorrect: i % 4 === 2, orderIndex: 1 },
                    { id: (i * 4) - 1, text: `Option C for question ${i}`, textTamil: `கேள்வி ${i} க்கான விருப்பம் இ`, isCorrect: i % 4 === 3, orderIndex: 2 },
                    { id: (i * 4), text: `Option D for question ${i}`, textTamil: `கேள்வி ${i} க்கான விருப்பம் ஈ`, isCorrect: i % 4 === 0, orderIndex: 3 }
                ]
            };

            console.log(`Generated question ${i}:`, question);
            questions.push(question);
        }

        console.log(`✅ Generated ${questions.length} sample questions`);
        console.log('Sample questions array:', questions);
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

        // Validate and clean questions data
        const validatedQuestions = questions.map((question, index) => {
            console.log(`Validating question ${index + 1}:`, question);

            // Ensure question has required fields
            const validatedQuestion: any = {
                id: question.id || index + 1,
                text: question.text || question.questionText || `Question ${index + 1}`,
                textTamil: question.textTamil || question.questionTextTamil || '',
                difficulty: question.difficulty || 'MEDIUM',
                language: question.language || 'ENGLISH',
                subjectId: question.subjectId || 1,
                options: []
            };

            // Validate options
            if (question.options && Array.isArray(question.options) && question.options.length > 0) {
                validatedQuestion.options = question.options.map((option: any, optIndex: number) => ({
                    id: option.id || optIndex + 1,
                    text: option.text || option.optionText || `Option ${optIndex + 1}`,
                    textTamil: option.textTamil || option.optionTextTamil || '',
                    isCorrect: option.isCorrect || false,
                    orderIndex: option.orderIndex || optIndex
                }));
            } else {
                // Generate default options if none provided
                console.warn(`No options found for question ${index + 1}, generating default options`);
                validatedQuestion.options = [
                    { id: (index * 4) + 1, text: 'Option A', textTamil: 'விருப்பம் அ', isCorrect: false, orderIndex: 0 },
                    { id: (index * 4) + 2, text: 'Option B', textTamil: 'விருப்பம் ஆ', isCorrect: false, orderIndex: 1 },
                    { id: (index * 4) + 3, text: 'Option C', textTamil: 'விருப்பம் இ', isCorrect: true, orderIndex: 2 },
                    { id: (index * 4) + 4, text: 'Option D', textTamil: 'விருப்பம் ஈ', isCorrect: false, orderIndex: 3 }
                ];
            }

            console.log(`Validated question ${index + 1}:`, validatedQuestion);
            return validatedQuestion;
        });

        console.log(`   Questions loaded:`);
        validatedQuestions.forEach((question, index) => {
            console.log(`     Question ${index + 1} (ID: ${question.id}): ${question.text}`);
            console.log(`       Question text: "${question.text}"`);
            console.log(`       Question textTamil: "${question.textTamil}"`);
            console.log(`       Options count: ${question.options?.length || 0}`);
            console.log(`       Options:`);
            if (question.options && Array.isArray(question.options)) {
                question.options.forEach((option: any) => {
                    console.log(`         Option ${option.id}: "${option.text}" (IsCorrect: ${option.isCorrect})`);
                });
            } else {
                console.log(`         No options found or options is not an array`);
            }
        });
        console.log(`--- END QUIZ INITIALIZATION ---\n`);

        this.quizSession = {
            attemptId: attemptId,
            questions: validatedQuestions,
            currentQuestionIndex: 0,
            answers: new Map(),
            flaggedQuestions: new Set(),
            startTime: new Date(),
            timeLimitSeconds: timeLimitMinutes * 60,
            isSubmitted: false
        };
        this.remainingTime = this.quizSession.timeLimitSeconds;
        this.isLoading = false;

        console.log(`✅ Quiz session initialized successfully`);
        console.log(`   Current question index: ${this.quizSession.currentQuestionIndex}`);
        console.log(`   First question:`, this.quizSession.questions[0]);
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
        console.log(`   Attempt ID: ${this.quizSession!.attemptId} (type: ${typeof this.quizSession!.attemptId})`);
        console.log(`   Total answers to submit: ${answers.length}`);
        console.log(`   Answers being sent:`);
        answers.forEach(answer => {
            console.log(`     Question ${answer.questionId}: Selected Option ${answer.selectedOptionId}`);
        });
        console.log(`   Full answers array:`, answers);
        console.log(`--- END SUBMISSION DATA ---\n`);

        // Ensure attemptId is a number
        const attemptId = parseInt(this.quizSession!.attemptId.toString(), 10);
        console.log(`🔢 Converted attempt ID: ${attemptId} (type: ${typeof attemptId})`);

        // Submit answers to backend using the mutation
        this.quizService.submitQuizAnswers(attemptId, answers)
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