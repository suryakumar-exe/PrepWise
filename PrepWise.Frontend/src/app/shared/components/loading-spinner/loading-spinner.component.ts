import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-loading-spinner',
    templateUrl: './loading-spinner.component.html',
    styleUrls: ['./loading-spinner.component.css']
})
export class LoadingSpinnerComponent {
    @Input() size: 'small' | 'medium' | 'large' = 'medium';
    @Input() color: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' = 'primary';
    @Input() text: string = 'Loading...';
    @Input() showText: boolean = true;
    @Input() overlay: boolean = false;
} 