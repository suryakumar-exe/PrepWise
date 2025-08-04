import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LanguageService } from '../../../core/services/language.service';
import { QuestionDifficulty, QuestionLanguage } from '../../../core/models/quiz.model';

export interface QuestionOption {
    id: number;
    text: string;
    textTamil?: string;
    isCorrect?: boolean;
    orderIndex: number;
}

export interface QuestionData {
    id: number;
    text: string;
    textTamil?: string;
    explanation?: string;
    difficulty: QuestionDifficulty;
    language: QuestionLanguage;
    subjectId: number;
    options: QuestionOption[];
}

@Component({
    selector: 'app-question-card',
    templateUrl: './question-card.component.html',
    styleUrls: ['./question-card.component.css']
})
export class QuestionCardComponent implements OnInit, OnDestroy {
    @Input() question!: QuestionData;
    @Input() questionNumber: number = 1;
    @Input() totalQuestions: number = 1;
    @Input() selectedOptionId: number | null = null;
    @Input() showResult: boolean = false;
    @Input() showExplanation: boolean = false;
    @Input() disabled: boolean = false;
    @Input() showQuestionNumber: boolean = true;
    @Input() allowMultipleSelection: boolean = false;

    @Output() optionSelected = new EventEmitter<number>();
    @Output() questionFlagged = new EventEmitter<number>();

    isFlagged: boolean = false;
    String = String;
    currentLanguage: QuestionLanguage = QuestionLanguage.English;
    private destroy$ = new Subject<void>();

    constructor(private languageService: LanguageService) { }

    ngOnInit(): void {
        console.log('=== QUESTION CARD INITIALIZATION ===');
        console.log('Question input:', this.question);
        console.log('Question text:', this.question?.text);
        console.log('Question options:', this.question?.options);

        // Sort options by orderIndex
        if (this.question?.options) {
            this.question.options.sort((a, b) => a.orderIndex - b.orderIndex);
            console.log('Sorted options:', this.question.options);
        }

        // Subscribe to language changes
        this.languageService.currentLanguage$.subscribe(language => {
            this.currentLanguage = language === 'ta' ? QuestionLanguage.Tamil : QuestionLanguage.English;
            console.log('Language changed to:', this.currentLanguage);
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    selectOption(optionId: number): void {
        if (this.disabled) return;

        this.optionSelected.emit(optionId);
    }

    toggleFlag(): void {
        this.isFlagged = !this.isFlagged;
        this.questionFlagged.emit(this.question.id);
    }

    getOptionClass(option: QuestionOption): string {
        const baseClass = 'option-item';

        if (this.disabled || !this.showResult) {
            // Normal state
            if (this.selectedOptionId === option.id) {
                return `${baseClass} selected`;
            }
            return baseClass;
        }

        // Result state
        if (option.isCorrect) {
            return `${baseClass} correct`;
        }

        if (this.selectedOptionId === option.id && !option.isCorrect) {
            return `${baseClass} incorrect`;
        }

        return baseClass;
    }

    getDifficultyColor(): string {
        switch (this.question?.difficulty?.toLowerCase()) {
            case 'easy':
                return 'success';
            case 'medium':
                return 'warning';
            case 'hard':
                return 'danger';
            default:
                return 'secondary';
        }
    }

    getLanguageFlag(): string {
        switch (this.question?.language?.toLowerCase()) {
            case 'tamil':
                return '🇮🇳';
            case 'english':
                return '🇺🇸';
            default:
                return '🌐';
        }
    }

    trackByOptionId(index: number, option: QuestionOption): number {
        return option.id;
    }

    getQuestionText(): string {
        console.log('=== GET QUESTION TEXT ===');
        console.log('Current language:', this.currentLanguage);
        console.log('Question:', this.question);
        console.log('Question text:', this.question?.text);
        console.log('Question textTamil:', this.question?.textTamil);

        if (this.currentLanguage === QuestionLanguage.Tamil && this.question?.textTamil) {
            console.log('Returning Tamil text:', this.question.textTamil);
            return this.question.textTamil;
        }
        console.log('Returning English text:', this.question?.text);
        return this.question?.text || 'Question text not available';
    }

    getOptionText(option: QuestionOption): string {
        console.log('=== GET OPTION TEXT ===');
        console.log('Current language:', this.currentLanguage);
        console.log('Option:', option);
        console.log('Option text:', option?.text);
        console.log('Option textTamil:', option?.textTamil);

        if (this.currentLanguage === QuestionLanguage.Tamil && option?.textTamil) {
            console.log('Returning Tamil text:', option.textTamil);
            return option.textTamil;
        }
        console.log('Returning English text:', option?.text);
        return option?.text || 'Option text not available';
    }
} 