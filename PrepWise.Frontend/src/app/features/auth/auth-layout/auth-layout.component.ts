import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LanguageService } from '../../../core/services/language.service';

@Component({
    selector: 'app-auth-layout',
    templateUrl: './auth-layout.component.html',
    styleUrls: ['./auth-layout.component.css']
})
export class AuthLayoutComponent implements OnInit {
    currentYear = new Date().getFullYear();

    constructor(
        private authService: AuthService,
        private router: Router,
        public languageService: LanguageService
    ) { }

    ngOnInit(): void {
        // Redirect if already logged in
        if (this.authService.isLoggedIn()) {
            this.router.navigate(['/dashboard']);
        }
    }

    onLanguageChange(languageCode: string): void {
        this.languageService.setLanguage(languageCode as any);
    }
} 