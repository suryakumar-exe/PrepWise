import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AuthService } from '../../../core/services/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { User } from '../../../core/models/user.model';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
    currentUser: User | null = null;
    isLoading = false;
    private destroy$ = new Subject<void>();

    // Mock subjects data (would come from backend in real app)
    subjects = [
        { id: 1, name: 'Tamil Subject Quiz', icon: 'bi-translate', color: '#e74c3c', description: 'Standard 6th to 10th Tamil' },
        { id: 2, name: 'Tamil Grammar', icon: 'bi-book', color: '#3498db', description: 'Grammar, Literature, Comprehension' },
        { id: 3, name: 'Simplification', icon: 'bi-calculator', color: '#2ecc71', description: 'Mathematical Simplification' },
        { id: 4, name: 'Percentage', icon: 'bi-percent', color: '#f39c12', description: 'Percentage Calculations' },
        { id: 5, name: 'HCF and LCM', icon: 'bi-diagram-3', color: '#9b59b6', description: 'Highest Common Factor & LCM' },
        { id: 6, name: 'Ratio and Proportion', icon: 'bi-pie-chart', color: '#1abc9c', description: 'Ratio and Proportion Problems' },
        { id: 7, name: 'Area and Volume', icon: 'bi-bounding-box', color: '#e67e22', description: 'Area and Volume Calculations' },
        { id: 8, name: 'General Science', icon: 'bi-atom', color: '#34495e', description: 'Physics, Chemistry, Biology' },
        { id: 9, name: 'Current Events', icon: 'bi-newspaper', color: '#c0392b', description: 'Current Affairs & News' },
        { id: 10, name: 'Geography', icon: 'bi-globe', color: '#27ae60', description: 'Indian and World Geography' },
        { id: 11, name: 'History and Culture', icon: 'bi-building', color: '#8e44ad', description: 'Indian History & Culture' },
        { id: 12, name: 'Indian Polity', icon: 'bi-bank', color: '#2980b9', description: 'Constitution and Politics' }
    ];

    constructor(
        private authService: AuthService,
        public languageService: LanguageService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadUserData();
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

    startQuiz(subjectId: number): void {
        this.router.navigate(['/quiz'], { queryParams: { subject: subjectId } });
    }

    startMockTest(): void {
        this.router.navigate(['/mock-test']);
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

    trackBySubjectId(index: number, subject: any): number {
        return subject.id;
    }

    getCurrentYear(): number {
        return new Date().getFullYear();
    }
} 