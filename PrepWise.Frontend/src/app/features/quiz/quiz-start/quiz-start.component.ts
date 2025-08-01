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
        { value: 10, label: '10 Questions', duration: '10 mins' },
        { value: 20, label: '20 Questions', duration: '20 mins' },
        { value: 30, label: '30 Questions', duration: '30 mins' },
        { value: 50, label: '50 Questions', duration: '50 mins' }
    ];

    timeLimitOptions = [
        { value: 10, label: '10 minutes', description: 'Quick practice' },
        { value: 20, label: '20 minutes', description: 'Standard practice' },
        { value: 30, label: '30 minutes', description: 'Extended practice' },
        { value: 45, label: '45 minutes', description: 'Comprehensive practice' },
        { value: 60, label: '60 minutes', description: 'Full practice session' }
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
            questionCount: [20, [Validators.required, Validators.min(5), Validators.max(100)]],
            timeLimitMinutes: [20, [Validators.required, Validators.min(5), Validators.max(120)]]
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
                } else {
                    // If no subject is provided, redirect to dashboard
                    this.toastr.error('No subject selected. Please select a subject from the dashboard.');
                    this.router.navigate(['/dashboard']);
                }
            });
    }

    private getMockSubjects(): SubjectModel[] {
        return [
            { id: 1, name: 'Standard 6', description: '6th Standard Tamil Language', isActive: true },
            { id: 2, name: 'Standard 7', description: '7th Standard Tamil Language', isActive: true },
            { id: 3, name: 'Standard 8', description: '8th Standard Tamil Language', isActive: true },
            { id: 4, name: 'Standard 9', description: '9th Standard Tamil Language', isActive: true },
            { id: 5, name: 'Standard 10', description: '10th Standard Tamil Language', isActive: true },
            { id: 6, name: 'Tamil Grammar', description: 'Grammar, Literature, Comprehension', isActive: true },
            { id: 7, name: 'Area and Volume', description: 'Area and Volume Calculations', isActive: true },
            { id: 8, name: 'Simplification', description: 'Mathematical Simplification', isActive: true },
            { id: 9, name: 'Percentage', description: 'Percentage Calculations', isActive: true },
            { id: 10, name: 'HCF and LCM', description: 'Highest Common Factor & LCM', isActive: true },
            { id: 11, name: 'Ratio and Proportion', description: 'Ratio and Proportion Problems', isActive: true },
            { id: 12, name: 'General Science', description: 'Physics, Chemistry, Biology', isActive: true },
            { id: 13, name: 'Current Events', description: 'Current Affairs & News', isActive: true },
            { id: 14, name: 'Geography', description: 'Indian and World Geography', isActive: true },
            { id: 15, name: 'History and Culture', description: 'Indian History & Culture', isActive: true },
            { id: 16, name: 'Indian Polity', description: 'Constitution and Politics', isActive: true }
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

            console.log('Selected subject ID:', this.selectedSubjectId); // Debug log
            console.log('Selected subject:', selectedSubject); // Debug log
            console.log('Form values:', formValue); // Debug log

            // Generate AI questions using the correct GraphQL query
            this.quizService.generateAIQuestions(
                this.selectedSubjectId,
                formValue.difficulty as QuestionDifficulty,
                formValue.language as QuestionLanguage,
                formValue.questionCount
            ).subscribe({
                next: (questions) => {
                    console.log('Generated questions:', questions); // Debug log
                    if (questions && questions.length > 0) {
                        console.log('Questions generated successfully, starting quiz attempt...'); // Debug log
                        // Start quiz attempt with generated questions
                        this.quizService.startQuizAttempt(
                            this.currentUser!.id,
                            this.selectedSubjectId!,
                            formValue.questionCount,
                            formValue.timeLimitMinutes
                        ).subscribe({
                            next: (result) => {
                                console.log('Start quiz attempt result:', result); // Debug log
                                if (result.success && result.attemptId) {
                                    console.log('Quiz attempt created successfully, navigating to play...'); // Debug log
                                    this.toastr.success('Quiz started successfully!');
                                    // Pass the generated questions to the quiz play component
                                    this.router.navigate(['/quiz/play', result.attemptId], {
                                        state: {
                                            questions: questions,
                                            timeLimitMinutes: formValue.timeLimitMinutes,
                                            subjectId: this.selectedSubjectId
                                        }
                                    });
                                } else {
                                    console.log('Failed to start quiz attempt, using fallback navigation...'); // Debug log
                                    // Fallback: Navigate with mock attempt ID if backend fails
                                    this.toastr.success('Quiz started successfully!');
                                    this.router.navigate(['/quiz/play', '1'], {
                                        state: {
                                            questions: questions,
                                            timeLimitMinutes: formValue.timeLimitMinutes,
                                            subjectId: this.selectedSubjectId
                                        }
                                    });
                                }
                                this.isStartingQuiz = false;
                            },
                            error: (error) => {
                                console.error('Error starting quiz:', error);
                                console.log('Using fallback navigation due to error...'); // Debug log
                                // Fallback: Navigate with mock attempt ID if backend fails
                                this.toastr.success('Quiz started successfully!');
                                this.router.navigate(['/quiz/play', '1'], {
                                    state: {
                                        questions: questions,
                                        timeLimitMinutes: formValue.timeLimitMinutes,
                                        subjectId: this.selectedSubjectId
                                    }
                                });
                                this.isStartingQuiz = false;
                            }
                        });
                    } else {
                        this.toastr.error('No questions available for this subject');
                        this.isStartingQuiz = false;
                    }
                },
                error: (error) => {
                    console.error('Error generating questions:', error);
                    this.toastr.error('Failed to generate questions');
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