import { Component, Input } from '@angular/core';

export interface ScoreData {
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    unansweredQuestions: number;
    timeTaken?: string;
    percentage: number;
}

@Component({
    selector: 'app-score-card',
    templateUrl: './score-card.component.html',
    styleUrls: ['./score-card.component.css']
})
export class ScoreCardComponent {
    @Input() scoreData!: ScoreData;
    @Input() showDetails: boolean = true;
    @Input() showTimeTaken: boolean = true;
    @Input() showPercentage: boolean = true;
    @Input() animated: boolean = true;
    @Input() size: 'small' | 'medium' | 'large' = 'medium';

    getScoreColor(): string {
        const percentage = this.scoreData?.percentage || 0;
        if (percentage >= 80) return 'success';
        if (percentage >= 60) return 'warning';
        return 'danger';
    }

    getScoreIcon(): string {
        const percentage = this.scoreData?.percentage || 0;
        if (percentage >= 80) return 'bi-trophy-fill';
        if (percentage >= 60) return 'bi-award-fill';
        return 'bi-x-circle-fill';
    }

    getGrade(): string {
        const percentage = this.scoreData?.percentage || 0;
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B+';
        if (percentage >= 60) return 'B';
        if (percentage >= 50) return 'C+';
        if (percentage >= 40) return 'C';
        return 'F';
    }

    getPerformanceMessage(): string {
        const percentage = this.scoreData?.percentage || 0;
        if (percentage >= 90) return 'Outstanding performance!';
        if (percentage >= 80) return 'Excellent work!';
        if (percentage >= 70) return 'Very good job!';
        if (percentage >= 60) return 'Good effort!';
        if (percentage >= 50) return 'Keep practicing!';
        if (percentage >= 40) return 'Need more practice.';
        return 'Focus on improvement.';
    }

    getCircumference(): number {
        return 2 * Math.PI * 45; // radius = 45
    }

    getStrokeDashoffset(): number {
        const circumference = this.getCircumference();
        const percentage = this.scoreData?.percentage || 0;
        return circumference - (percentage / 100) * circumference;
    }
} 