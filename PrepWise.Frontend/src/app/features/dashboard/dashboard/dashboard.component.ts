import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AuthService } from '../../../core/services/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { QuizService } from '../../../core/services/quiz.service';
import { User } from '../../../core/models/user.model';

interface SubjectCategory {
    name: string;
    description: string;
    subjects: SubjectItem[];
}

interface SubjectItem {
    id: number;
    name: string;
    description: string;
    icon: string;
    color: string;
    category: string;
}

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
    currentUser: User | null = null;
    isLoading = false;
    subjectCategories: SubjectCategory[] = [];
    private destroy$ = new Subject<void>();

    constructor(
        private authService: AuthService,
        public languageService: LanguageService,
        private quizService: QuizService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadUserData();
        this.initializeSubjectCategories();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private loadUserData(): void {
        this.authService.currentUser$
            .pipe(takeUntil(this.destroy$))
            .subscribe(user => {
                this.currentUser = user;
            });
    }

    private initializeSubjectCategories(): void {
        this.subjectCategories = [
            {
                name: 'PART A: Tamil',
                description: 'Tamil language and literature',
                subjects: [
                    {
                        id: 1,
                        name: 'Tamil Subject Quiz',
                        description: 'Standard 6th to 10th Tamil - Individual sections for each standard',
                        icon: 'bi-translate',
                        color: '#e74c3c',
                        category: 'Tamil'
                    },
                    {
                        id: 2,
                        name: 'Tamil Quiz',
                        description: 'Grammar, Literature, Comprehension and Vocabulary',
                        icon: 'bi-book',
                        color: '#3498db',
                        category: 'Tamil'
                    }
                ]
            },
            {
                name: 'PART B: Aptitude and Mental Ability',
                description: 'Mathematical and logical reasoning',
                subjects: [
                    {
                        id: 3,
                        name: 'Simplification',
                        description: 'Mathematical Simplification',
                        icon: 'bi-calculator',
                        color: '#2ecc71',
                        category: 'Aptitude'
                    },
                    {
                        id: 4,
                        name: 'Percentage',
                        description: 'Percentage Calculations',
                        icon: 'bi-percent',
                        color: '#f39c12',
                        category: 'Aptitude'
                    },
                    {
                        id: 5,
                        name: 'HCF and LCM',
                        description: 'Highest Common Factor & Least Common Multiple',
                        icon: 'bi-diagram-3',
                        color: '#9b59b6',
                        category: 'Aptitude'
                    },
                    {
                        id: 6,
                        name: 'Ratio and Proportion',
                        description: 'Ratio and Proportion Problems',
                        icon: 'bi-pie-chart',
                        color: '#1abc9c',
                        category: 'Aptitude'
                    },
                    {
                        id: 7,
                        name: 'Area and Volume',
                        description: 'Area and Volume Calculations',
                        icon: 'bi-bounding-box',
                        color: '#e67e22',
                        category: 'Aptitude'
                    }
                ]
            },
            {
                name: 'PART C: General Studies',
                description: 'General knowledge and current affairs',
                subjects: [
                    {
                        id: 8,
                        name: 'General Science',
                        description: 'Physics, Chemistry, Biology and other sciences',
                        icon: 'bi-atom',
                        color: '#34495e',
                        category: 'GeneralStudies'
                    },
                    {
                        id: 9,
                        name: 'Current Events',
                        description: 'Current Affairs and Latest News',
                        icon: 'bi-newspaper',
                        color: '#c0392b',
                        category: 'GeneralStudies'
                    },
                    {
                        id: 10,
                        name: 'Geography',
                        description: 'Indian and World Geography',
                        icon: 'bi-globe',
                        color: '#27ae60',
                        category: 'GeneralStudies'
                    },
                    {
                        id: 11,
                        name: 'History and Culture',
                        description: 'Indian History and Culture',
                        icon: 'bi-building',
                        color: '#8e44ad',
                        category: 'GeneralStudies'
                    },
                    {
                        id: 12,
                        name: 'Indian Polity',
                        description: 'Constitution, Politics and Governance',
                        icon: 'bi-bank',
                        color: '#2980b9',
                        category: 'GeneralStudies'
                    }
                ]
            }
        ];
    }

    startQuiz(subjectId: number): void {
        // Navigate to quiz start page with subject ID
        this.router.navigate(['/quiz/start'], { queryParams: { subject: subjectId } });
    }

    startMockTest(): void {
        this.router.navigate(['/mock-test/start']);
    }

    openChat(): void {
        this.router.navigate(['/chat']);
    }

    viewAnalytics(): void {
        this.router.navigate(['/analytics']);
    }

    viewLeaderboard(): void {
        this.router.navigate(['/leaderboard']);
    }

    logout(): void {
        this.authService.logout();
    }

    trackBySubjectId(index: number, subject: SubjectItem): number {
        return subject.id;
    }

    getCurrentYear(): number {
        return new Date().getFullYear();
    }
} 