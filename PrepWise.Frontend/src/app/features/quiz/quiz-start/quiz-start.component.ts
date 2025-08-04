import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { QuizService } from '../../../core/services/quiz.service';
import { AuthService } from '../../../core/services/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { Subject as SubjectModel, QuestionDifficulty, QuestionLanguage } from '../../../core/models/quiz.model';
import { User } from '../../../core/models/user.model';

@Component({
    selector: 'app-quiz-start',
    templateUrl: './quiz-start.component.html',
    styleUrls: ['./quiz-start.component.css']
})
export class QuizStartComponent implements OnInit, OnDestroy {
    quizForm!: FormGroup;
    subjects: SubjectModel[] = [];
    currentUser: User | null = null;
    isLoading = false;
    isStartingQuiz = false;
    selectedSubjectId: number | null = null;

    private destroy$ = new Subject<void>();

    // Options for form
    difficultyOptions = [
        { value: QuestionDifficulty.Easy, label: 'Easy', description: 'Basic level questions' },
        { value: QuestionDifficulty.Medium, label: 'Medium', description: 'Intermediate level questions' },
        { value: QuestionDifficulty.Hard, label: 'Hard', description: 'Advanced level questions' }
    ];

    languageOptions = [
        { value: QuestionLanguage.English, label: 'English', flag: '🇺🇸' },
        { value: QuestionLanguage.Tamil, label: 'Tamil', flag: '🇮🇳' }
    ];

    questionCountOptions = [
        { value: 2, label: '2 Questions', duration: '2 mins' },
        { value: 5, label: '5 Questions', duration: '5 mins' },
        { value: 10, label: '10 Questions', duration: '10 mins' },
        { value: 20, label: '20 Questions', duration: '20 mins' },
        { value: 30, label: '30 Questions', duration: '30 mins' },
        { value: 50, label: '50 Questions', duration: '50 mins' }
    ];

    timeLimitOptions = [
        { value: 5, label: '5 minutes', description: 'Quick practice' },
        { value: 10, label: '10 minutes', description: 'Standard practice' },
        { value: 20, label: '20 minutes', description: 'Extended practice' },
        { value: 30, label: '30 minutes', description: 'Comprehensive practice' },
        { value: 45, label: '45 minutes', description: 'Full practice session' },
        { value: 60, label: '60 minutes', description: 'Extended session' }
    ];

    constructor(
        private formBuilder: FormBuilder,
        private quizService: QuizService,
        private authService: AuthService,
        private languageService: LanguageService,
        private router: Router,
        private route: ActivatedRoute,
        private toastr: ToastrService
    ) { }

    ngOnInit(): void {
        this.initializeForm();
        this.loadCurrentUser();
        this.loadSubjects();
        this.checkQueryParams();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private initializeForm(): void {
        this.quizForm = this.formBuilder.group({
            difficulty: [QuestionDifficulty.Medium, [Validators.required]],
            language: [QuestionLanguage.English, [Validators.required]],
            questionCount: [2, [Validators.required, Validators.min(2), Validators.max(100)]],
            timeLimitMinutes: [5, [Validators.required, Validators.min(5), Validators.max(120)]]
        });
    }

    private loadCurrentUser(): void {
        this.authService.currentUser$
            .pipe(takeUntil(this.destroy$))
            .subscribe(user => {
                this.currentUser = user;
            });
    }

    private loadSubjects(): void {
        this.isLoading = true;
        this.quizService.getSubjects()
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => this.isLoading = false)
            )
            .subscribe({
                next: (subjects) => {
                    this.subjects = subjects.filter(s => s.isActive);
                },
                error: (error) => {
                    console.error('Error loading subjects:', error);
                    // Use mock subjects if API fails
                    this.subjects = this.getMockSubjects();
                }
            });
    }

    private checkQueryParams(): void {
        this.route.queryParams
            .pipe(takeUntil(this.destroy$))
            .subscribe(params => {
                if (params['subject']) {
                    const subjectId = parseInt(params['subject'], 10);
                    this.selectedSubjectId = subjectId;
                    console.log(`Subject selected from query params: ${subjectId}`);
                } else {
                    // If no subject is provided, just log it - don't redirect
                    console.log('No subject in query params - user can select from dropdown');
                }
            });
    }

    private getMockSubjects(): SubjectModel[] {
        return [
            // Standard Subjects (6-10) - Grouped together
            { id: 1, name: 'Standard6to10', description: '6th to 10th Standard Tamil Language', isActive: true },

            // Language & Literature
            { id: 2, name: 'Tamil Grammar', description: 'Grammar, Literature, Comprehension', isActive: true },

            // Mathematics Subjects
            { id: 3, name: 'Area and Volume', description: 'Area and Volume Calculations', isActive: true },
            { id: 4, name: 'Simplification', description: 'Mathematical Simplification', isActive: true },
            { id: 5, name: 'Percentage', description: 'Percentage Calculations', isActive: true },
            { id: 6, name: 'HCF and LCM', description: 'Highest Common Factor & LCM', isActive: true },
            { id: 7, name: 'Ratio and Proportion', description: 'Ratio and Proportion Problems', isActive: true },

            // Science & General Knowledge
            { id: 8, name: 'General Science', description: 'Physics, Chemistry, Biology', isActive: true },
            { id: 9, name: 'Current Events', description: 'Current Affairs & News', isActive: true },
            { id: 10, name: 'Geography', description: 'Indian and World Geography', isActive: true },
            { id: 11, name: 'History and Culture', description: 'Indian History & Culture', isActive: true },
            { id: 12, name: 'Indian Polity', description: 'Constitution and Politics', isActive: true }
        ];
    }

    onStartQuiz(): void {
        if (this.quizForm.valid && this.currentUser && this.selectedSubjectId) {
            this.isStartingQuiz = true;

            const formValue = this.quizForm.value;
            const selectedSubject = this.getSelectedSubject();

            if (!selectedSubject) {
                this.toastr.error('Please select a subject');
                this.isStartingQuiz = false;
                return;
            }



            // Start quiz attempt directly - it will return questions
            this.quizService.startQuizAttempt(
                this.currentUser!.id,
                this.selectedSubjectId!,
                formValue.questionCount,
                formValue.timeLimitMinutes
            ).subscribe({
                next: (result) => {
                    console.log('Quiz start result:', result);

                    if (result.success && result.attemptId && result.questions) {
                        console.log('✅ Quiz started successfully');
                        console.log('Attempt ID:', result.attemptId);
                        console.log('Questions count:', result.questions.length);
                        console.log('Message:', result.message);
                        console.log('Raw questions from backend:', result.questions);

                        // Validate questions array
                        if (!Array.isArray(result.questions) || result.questions.length === 0) {
                            console.error('❌ Questions array is empty or invalid');
                            this.toastr.error('No questions available for this subject. Please try another subject.', 'No Questions Available');
                            return;
                        }

                        // Transform questions to ensure they have the correct structure
                        const transformedQuestions = result.questions.map((q: any, index: number) => {
                            console.log(`Transforming question ${index + 1}:`, q);

                            return {
                                id: q.id || index + 1,
                                text: q.text || q.questionText || `Question ${index + 1}`,
                                textTamil: q.textTamil || q.questionTextTamil || '',
                                difficulty: q.difficulty || 'MEDIUM',
                                language: q.language || 'ENGLISH',
                                subjectId: q.subjectId || this.selectedSubjectId,
                                options: (q.options || []).map((opt: any, optIndex: number) => ({
                                    id: opt.id || optIndex + 1,
                                    text: opt.text || opt.optionText || `Option ${optIndex + 1}`,
                                    textTamil: opt.textTamil || opt.optionTextTamil || '',
                                    isCorrect: opt.isCorrect || false,
                                    orderIndex: opt.orderIndex || optIndex
                                }))
                            };
                        });

                        console.log('Transformed questions:', transformedQuestions);

                        // Use the actual number of questions received, not the requested count
                        const actualQuestionCount = transformedQuestions.length;
                        console.log(`📊 Actual questions received: ${actualQuestionCount} (requested: ${formValue.questionCount})`);

                        // Check if we got the expected number of questions
                        if (actualQuestionCount < formValue.questionCount) {
                            console.warn(`⚠️ Got ${actualQuestionCount} questions, requested ${formValue.questionCount}`);
                            this.toastr.warning(`Only ${actualQuestionCount} questions available for this subject.`, 'Limited Questions');
                        }

                        // Store questions in session storage with actual count
                        sessionStorage.setItem('quizQuestions', JSON.stringify(transformedQuestions));
                        sessionStorage.setItem('quizAttemptId', result.attemptId.toString());
                        sessionStorage.setItem('quizQuestionCount', actualQuestionCount.toString()); // Use actual count
                        sessionStorage.setItem('quizTimeLimit', formValue.timeLimitMinutes.toString());
                        sessionStorage.setItem('quizSubjectId', this.selectedSubjectId!.toString());

                        // Navigate to quiz play with state
                        console.log('=== NAVIGATING TO QUIZ PLAY ===');
                        console.log('Attempt ID:', result.attemptId);
                        console.log('Navigation state:', {
                            questions: transformedQuestions,
                            timeLimitMinutes: formValue.timeLimitMinutes,
                            attemptId: result.attemptId,
                            questionCount: actualQuestionCount
                        });

                        this.router.navigate(['/quiz/play', result.attemptId], {
                            state: {
                                questions: transformedQuestions,
                                timeLimitMinutes: formValue.timeLimitMinutes,
                                attemptId: result.attemptId,
                                questionCount: actualQuestionCount // Use actual count
                            }
                        }).then(() => {
                            console.log('✅ Navigation to quiz play successful');
                        }).catch((error) => {
                            console.error('❌ Navigation to quiz play failed:', error);
                            this.toastr.error('Failed to navigate to quiz. Please try again.', 'Navigation Error');
                        });
                    } else {
                        console.error('❌ Quiz start failed');
                        console.error('Success:', result.success);
                        console.error('Attempt ID:', result.attemptId);
                        console.error('Questions:', result.questions);
                        console.error('Message:', result.message);

                        let errorMessage = result.message || 'Failed to start quiz';

                        // Provide more specific error messages based on the issue
                        if (result.success && result.attemptId && (!result.questions || result.questions.length === 0)) {
                            errorMessage = `No questions available for "${selectedSubject?.name}". Please try another subject.`;
                        } else if (!result.success) {
                            errorMessage = `Failed to start quiz: ${result.message}`;
                        }

                        this.toastr.error(errorMessage, 'Quiz Start Failed');
                        this.isStartingQuiz = false;
                    }
                },
                error: (error) => {
                    console.error('Error starting quiz:', error);
                    console.error('Error details:', error.error);

                    let errorMessage = 'Failed to start quiz';

                    if (error.status === 404) {
                        errorMessage = `Subject "${selectedSubject?.name}" not found. Please select a valid subject.`;
                    } else if (error.status === 500) {
                        errorMessage = 'Server error. Please try again later.';
                    } else if (error.error?.message) {
                        errorMessage = error.error.message;
                    }

                    this.toastr.error(errorMessage, 'Error');
                    this.isStartingQuiz = false;
                }
            });
        } else {
            this.markFormGroupTouched();
        }
    }

    onBackToDashboard(): void {
        this.router.navigate(['/dashboard']);
    }

    // Helper methods
    isFieldInvalid(fieldName: string): boolean {
        const field = this.quizForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    getFieldError(fieldName: string): string {
        const field = this.quizForm.get(fieldName);
        if (field && field.errors && (field.dirty || field.touched)) {
            if (field.errors['required']) {
                return `${fieldName} is required`;
            }
            if (field.errors['min']) {
                return `Minimum value is ${field.errors['min'].min}`;
            }
            if (field.errors['max']) {
                return `Maximum value is ${field.errors['max'].max}`;
            }
        }
        return '';
    }

    private markFormGroupTouched(): void {
        Object.keys(this.quizForm.controls).forEach(key => {
            const control = this.quizForm.get(key);
            control?.markAsTouched();
        });
    }

    getSelectedSubject(): SubjectModel | undefined {
        return this.subjects.find(s => s.id === this.selectedSubjectId);
    }

    getDifficultyColor(difficulty: QuestionDifficulty): string {
        switch (difficulty) {
            case QuestionDifficulty.Easy: return 'success';
            case QuestionDifficulty.Medium: return 'warning';
            case QuestionDifficulty.Hard: return 'danger';
            default: return 'secondary';
        }
    }
} 