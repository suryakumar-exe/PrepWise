import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { LeaderboardService } from '../../../core/services/leaderboard.service';
import { LanguageService } from '../../../core/services/language.service';
import { AuthService } from '../../../core/services/auth.service';
import { LeaderboardEntry, Subject as SubjectModel } from '../../../core/models/leaderboard.model';

@Component({
    selector: 'app-leaderboard',
    templateUrl: './leaderboard.component.html',
    styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent implements OnInit, OnDestroy {
    leaderboardData: LeaderboardEntry[] = [];
    subjects: SubjectModel[] = [];
    selectedSubjectId: number | null = null;
    selectedTimeFrame: string = 'all';
    isLoading = false;
    currentUserRank: number | null = null;
    currentUserScore: number | null = null;
    currentUser: any = null;
    Math = Math;
    private isDataLoading = false; // Prevent multiple simultaneous calls

    timeFrames = [
        { value: 'all', label: 'All Time' },
        { value: 'month', label: 'This Month' },
        { value: 'week', label: 'This Week' },
        { value: 'today', label: 'Today' }
    ];

    private destroy$ = new Subject<void>();

    constructor(
        private router: Router,
        private leaderboardService: LeaderboardService,
        private authService: AuthService,
        private toastr: ToastrService,
        public languageService: LanguageService
    ) { }

    ngOnInit(): void {
        this.loadCurrentUser();
        this.loadSubjects();
        // Don't call loadLeaderboard here - wait for user to be loaded
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private loadCurrentUser(): void {
        this.authService.currentUser$
            .pipe(takeUntil(this.destroy$))
            .subscribe(user => {
                this.currentUser = user;
                if (!user) {
                    this.toastr.error('Please login to view leaderboard');
                    this.router.navigate(['/login']);
                } else {
                    // Only load leaderboard after user is loaded
                    this.loadLeaderboard();
                }
            });
    }

    async loadSubjects(): Promise<void> {
        try {
            const subjects = await this.leaderboardService.getSubjects().toPromise();
            this.subjects = subjects || [];
            console.log('Loaded subjects:', this.subjects);
        } catch (error) {
            console.error('Error loading subjects:', error);
            this.toastr.error('Failed to load subjects');
        }
    }

    async loadLeaderboard(): Promise<void> {
        if (!this.currentUser) {
            return;
        }

        // Prevent multiple simultaneous calls
        if (this.isDataLoading) {
            console.log('Data loading already in progress, skipping...');
            return;
        }

        this.isDataLoading = true;
        this.isLoading = true;

        try {
            console.log('=== LOADING LEADERBOARD ===');
            console.log('Loading leaderboard for subject:', this.selectedSubjectId);
            console.log('Current user:', this.currentUser);
            console.log('Time frame:', this.selectedTimeFrame);
            console.log('Service call parameters:', {
                subjectId: this.selectedSubjectId || undefined,
                timeFrame: this.selectedTimeFrame
            });

            console.log('=== USING TEST QUERY LOGIC ===');

            // Use the test query logic which works correctly
            const result = await this.leaderboardService.testLeaderboardQuery(
                this.selectedSubjectId || undefined
            ).toPromise();

            console.log('Raw result from service:', result);

            // Check if the raw data already contains duplicates
            if (result?.entries) {
                const rawUserIds = result.entries.map(entry => entry.userId);
                const uniqueRawUserIds = [...new Set(rawUserIds)];
                if (rawUserIds.length !== uniqueRawUserIds.length) {
                    console.warn('DUPLICATES IN RAW SERVICE DATA!');
                    console.warn('Raw entries count:', rawUserIds.length);
                    console.warn('Unique users in raw data:', uniqueRawUserIds.length);
                }
            }

            this.leaderboardData = result?.entries || [];
            this.currentUserRank = result?.currentUserRank || null;
            this.currentUserScore = result?.currentUserScore || null;

            console.log('Processed leaderboard data:', {
                entriesCount: this.leaderboardData.length,
                currentUserRank: this.currentUserRank,
                currentUserScore: this.currentUserScore,
                entries: this.leaderboardData
            });

            if (this.leaderboardData.length === 0) {
                this.toastr.info('No leaderboard data available for this selection.');
            } else {
                console.log('Leaderboard entries:', this.leaderboardData);
                // Check for duplicates
                const userIds = this.leaderboardData.map(entry => entry.userId);
                const uniqueUserIds = [...new Set(userIds)];
                if (userIds.length !== uniqueUserIds.length) {
                    console.warn('DUPLICATE ENTRIES DETECTED!');
                    console.warn('Total entries:', userIds.length);
                    console.warn('Unique users:', uniqueUserIds.length);
                    console.warn('Duplicate user IDs:', userIds.filter((id, index) => userIds.indexOf(id) !== index));
                }
            }
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            this.toastr.error('Failed to load leaderboard data');
            this.leaderboardData = [];
            this.currentUserRank = null;
            this.currentUserScore = null;
        } finally {
            this.isLoading = false;
            this.isDataLoading = false;
        }
    }

    onSubjectChange(): void {
        console.log('=== SUBJECT CHANGE ===');
        console.log('Selected Subject ID (before conversion):', this.selectedSubjectId, 'Type:', typeof this.selectedSubjectId);

        // Clear any cached data
        this.leaderboardData = [];
        this.currentUserRank = null;
        this.currentUserScore = null;

        // Convert string to number if it's not null
        if (this.selectedSubjectId !== null && this.selectedSubjectId !== undefined) {
            const originalValue = this.selectedSubjectId;
            this.selectedSubjectId = Number(this.selectedSubjectId);
            console.log(`Converted ${originalValue} (${typeof originalValue}) to ${this.selectedSubjectId} (${typeof this.selectedSubjectId})`);
        }

        console.log('Selected Subject ID (after conversion):', this.selectedSubjectId, 'Type:', typeof this.selectedSubjectId);
        console.log('Available Subjects:', this.subjects);

        // Find the selected subject for debugging
        const selectedSubject = this.subjects.find(s => s.id === this.selectedSubjectId);
        console.log('Selected Subject:', selectedSubject);

        // Force immediate load without delay
        this.loadLeaderboard();
    }

    onTimeFrameChange(): void {
        console.log('Time frame changed to:', this.selectedTimeFrame);
        this.loadLeaderboard();
    }

    getRankBadge(rank: number): string {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    }

    getRankClass(rank: number): string {
        if (rank === 1) return 'rank-gold';
        if (rank === 2) return 'rank-silver';
        if (rank === 3) return 'rank-bronze';
        return 'rank-normal';
    }

    getScoreColor(score: number): string {
        if (score >= 90) return 'text-success';
        if (score >= 80) return 'text-info';
        if (score >= 70) return 'text-primary';
        if (score >= 60) return 'text-warning';
        return 'text-danger';
    }

    getTimeFrameLabel(): string {
        const timeFrame = this.timeFrames.find(t => t.value === this.selectedTimeFrame);
        return timeFrame ? timeFrame.label : 'All Time';
    }

    getAverageScore(): number {
        if (this.leaderboardData.length === 0) return 0;
        const totalScore = this.leaderboardData.reduce((sum, entry) => sum + entry.score, 0);
        return Math.round(totalScore / this.leaderboardData.length);
    }

    getAverageTestsTaken(): number {
        if (this.leaderboardData.length === 0) return 0;
        const totalTests = this.leaderboardData.reduce((sum, entry) => sum + entry.testsTaken, 0);
        return Math.round(totalTests / this.leaderboardData.length);
    }

    getActiveParticipants(): number {
        return this.leaderboardData.length;
    }

    goToDashboard(): void {
        this.router.navigate(['/dashboard']);
    }

    viewUserProfile(userId: number): void {
        this.router.navigate(['/profile'], { queryParams: { userId } });
    }

    shareLeaderboard(): void {
        const subjectName = this.selectedSubjectId
            ? this.subjects.find(s => s.id === this.selectedSubjectId)?.name
            : 'Overall';

        const text = `Check out the ${subjectName} leaderboard on PrepWise!`;

        if (navigator.share) {
            navigator.share({
                title: 'PrepWise Leaderboard',
                text: text,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(text).then(() => {
                this.toastr.success('Leaderboard link copied to clipboard!');
            });
        }
    }

    hasData(): boolean {
        return this.leaderboardData.length > 0;
    }

    getSelectedSubjectName(): string {
        if (!this.selectedSubjectId) return 'All Subjects';
        const subject = this.subjects.find(s => s.id === this.selectedSubjectId);
        return subject ? subject.name : 'All Subjects';
    }

    // Helper method to round scores to whole numbers
    roundScore(score: number): number {
        return Math.round(score);
    }

    // Test method to manually test the leaderboard query
    testLeaderboardQuery(): void {
        console.log('=== MANUAL TEST ===');
        this.leaderboardService.testLeaderboardQuery(this.selectedSubjectId || undefined).subscribe({
            next: (result) => {
                console.log('Manual test result:', result);
                this.leaderboardData = result.entries;
                this.currentUserRank = result.currentUserRank;
                this.currentUserScore = result.currentUserScore;
                this.toastr.success('Test query completed! Check console for details.');
            },
            error: (error) => {
                console.error('Manual test error:', error);
                this.toastr.error('Test query failed! Check console for details.');
            }
        });
    }
} 