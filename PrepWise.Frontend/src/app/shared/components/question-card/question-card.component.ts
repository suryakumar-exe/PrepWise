import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

export interface QuestionOption {
    id: number;
    text: string;
    isCorrect?: boolean;
    orderIndex: number;
}

export interface QuestionData {
    id: number;
    text: string;
    explanation?: string;
    difficulty: string;
    language: string;
    subjectId: number;
    options: QuestionOption[];
}

@Component({
    selector: 'app-question-card',
    templateUrl: './question-card.component.html',
    styleUrls: ['./question-card.component.css']
})
export class QuestionCardComponent implements OnInit {
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

    ngOnInit(): void {
        // Sort options by orderIndex
        if (this.question?.options) {
            this.question.options.sort((a, b) => a.orderIndex - b.orderIndex);
        }
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
} 