import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    title = 'PrepWise - TNPSC AI-Powered Quiz Platform';
    isLoading = true;

    constructor(
        private router: Router,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        // Initialize app
        this.initializeApp();

        // Listen to route changes for loading states
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe(() => {
            this.isLoading = false;
        });
    }

    private initializeApp(): void {
        // Check if user is already logged in
        if (this.authService.isLoggedIn()) {
            // Load user data or navigate to dashboard
            this.router.navigate(['/dashboard']);
        } else {
            // Navigate to login page
            this.router.navigate(['/auth/login']);
        }

        setTimeout(() => {
            this.isLoading = false;
        }, 1000);
    }
} 