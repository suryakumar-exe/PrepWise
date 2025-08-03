import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent {
    @Input() show: boolean = false;
    @Input() title: string = 'Confirm Action';
    @Input() message: string = 'Are you sure you want to proceed?';
    @Input() confirmText: string = 'Confirm';
    @Input() cancelText: string = 'Cancel';
    @Input() confirmClass: string = 'btn-primary';
    @Input() isLoading: boolean = false;

    @Output() confirmed = new EventEmitter<void>();
    @Output() cancelled = new EventEmitter<void>();

    onConfirm(): void {
        if (!this.isLoading) {
            this.confirmed.emit();
        }
    }

    onCancel(): void {
        if (!this.isLoading) {
            this.cancelled.emit();
        }
    }

    onBackdropClick(event: Event): void {
        if (event.target === event.currentTarget) {
            this.onCancel();
        }
    }
} 