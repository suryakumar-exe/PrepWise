import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { interval, Subscription } from 'rxjs';

@Component({
    selector: 'app-timer',
    templateUrl: './timer.component.html',
    styleUrls: ['./timer.component.css']
})
export class TimerComponent implements OnInit, OnDestroy {
    @Input() totalSeconds: number = 0; // Total time in seconds
    @Input() autoStart: boolean = true;
    @Input() showMilliseconds: boolean = false;
    @Input() warningThreshold: number = 300; // 5 minutes warning
    @Input() dangerThreshold: number = 60; // 1 minute danger

    @Output() timeUp = new EventEmitter<void>();
    @Output() timeChanged = new EventEmitter<number>();
    @Output() warningTriggered = new EventEmitter<number>();
    @Output() dangerTriggered = new EventEmitter<number>();

    remainingSeconds: number = 0;
    isRunning: boolean = false;
    isPaused: boolean = false;
    isWarning: boolean = false;
    isDanger: boolean = false;

    private timerSubscription?: Subscription;
    private warningTriggeredFlag: boolean = false;
    private dangerTriggeredFlag: boolean = false;

    ngOnInit(): void {
        this.remainingSeconds = this.totalSeconds;
        if (this.autoStart) {
            this.start();
        }
    }

    ngOnDestroy(): void {
        this.stop();
    }

    start(): void {
        if (this.remainingSeconds <= 0) return;

        this.isRunning = true;
        this.isPaused = false;

        this.timerSubscription = interval(1000).subscribe(() => {
            if (this.remainingSeconds > 0) {
                this.remainingSeconds--;
                this.timeChanged.emit(this.remainingSeconds);
                this.checkThresholds();
            } else {
                this.timeUp.emit();
                this.stop();
            }
        });
    }

    pause(): void {
        this.isPaused = true;
        this.isRunning = false;
        this.timerSubscription?.unsubscribe();
    }

    resume(): void {
        if (this.isPaused) {
            this.start();
        }
    }

    stop(): void {
        this.isRunning = false;
        this.isPaused = false;
        this.timerSubscription?.unsubscribe();
    }

    reset(): void {
        this.stop();
        this.remainingSeconds = this.totalSeconds;
        this.isWarning = false;
        this.isDanger = false;
        this.warningTriggeredFlag = false;
        this.dangerTriggeredFlag = false;
    }

    addTime(seconds: number): void {
        this.remainingSeconds += seconds;
        this.totalSeconds += seconds;
    }

    private checkThresholds(): void {
        // Check danger threshold
        if (this.remainingSeconds <= this.dangerThreshold && !this.dangerTriggeredFlag) {
            this.isDanger = true;
            this.dangerTriggeredFlag = true;
            this.dangerTriggered.emit(this.remainingSeconds);
        }
        // Check warning threshold
        else if (this.remainingSeconds <= this.warningThreshold && !this.warningTriggeredFlag) {
            this.isWarning = true;
            this.warningTriggeredFlag = true;
            this.warningTriggered.emit(this.remainingSeconds);
        }
    }

    get formattedTime(): string {
        const hours = Math.floor(this.remainingSeconds / 3600);
        const minutes = Math.floor((this.remainingSeconds % 3600) / 60);
        const seconds = this.remainingSeconds % 60;

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    get progressPercentage(): number {
        if (this.totalSeconds === 0) return 0;
        return ((this.totalSeconds - this.remainingSeconds) / this.totalSeconds) * 100;
    }

    get timeColor(): string {
        if (this.isDanger) return 'danger';
        if (this.isWarning) return 'warning';
        return 'primary';
    }
} 