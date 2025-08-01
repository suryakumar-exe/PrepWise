import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LeaderboardService } from '../../../core/services/leaderboard.service';
import { LanguageService } from '../../../core/services/language.service';
import { LeaderboardEntry, Subject } from '../../../core/models/leaderboard.model';

@Component({
    selector: 'app-leaderboard',
    templateUrl: './leaderboard.component.html',
    styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent implements OnInit {
    leaderboardData: LeaderboardEntry[] = [];
    subjects: Subject[] = [];
    selectedSubjectId: number | null = null;
    selectedTimeFrame: string = 'all';
    isLoading = false;
    currentUserRank: number | null = null;
    currentUserScore: number | null = null;
    Math = Math;

    timeFrames = [
        { value: 'all', label: 'All Time' },
        { value: 'month', label: 'This Month' },
        { value: 'week', label: 'This Week' },
        { value: 'today', label: 'Today' }
    ];

    constructor(
        private router: Router,
        private leaderboardService: LeaderboardService,
        private toastr: ToastrService,
        public languageService: LanguageService
    ) { }

    ngOnInit(): void {
        this.loadSubjects();
        this.loadLeaderboard();
    }

    async loadSubjects(): Promise<void> {
        try {
            const subjects = await this.leaderboardService.getSubjects().toPromise();
            this.subjects = subjects || [];
        } catch (error) {
            console.error('Error loading subjects:', error);
            this.toastr.error('Failed to load subjects');
        }
    }

    async loadLeaderboard(): Promise<void> {
        this.isLoading = true;
        try {
            const result = await this.leaderboardService.getLeaderboard(
                this.selectedSubjectId,
                this.selectedTimeFrame
            ).toPromise();

            this.leaderboardData = result?.entries || [];
            this.currentUserRank = result?.currentUserRank || null;
            this.currentUserScore = result?.currentUserScore || null;
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            this.toastr.error('Failed to load leaderboard data');
        } finally {
            this.isLoading = false;
        }
    }

    onSubjectChange(): void {
        this.loadLeaderboard();
    }

    onTimeFrameChange(): void {
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
} 