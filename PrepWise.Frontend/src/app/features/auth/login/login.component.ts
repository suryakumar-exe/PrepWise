import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { AuthService } from '../../../core/services/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
    loginForm!: FormGroup;
    isLoading = false;
    showPassword = false;
    returnUrl = '/dashboard';
    private destroy$ = new Subject<void>();

    constructor(
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute,
        public languageService: LanguageService,
        private loadingService: LoadingService
    ) { }

    ngOnInit(): void {
        this.initializeForm();
        this.getReturnUrl();

        // Subscribe to loading state
        this.loadingService.loading$
            .pipe(takeUntil(this.destroy$))
            .subscribe(loading => this.isLoading = loading);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private initializeForm(): void {
        this.loginForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            rememberMe: [false]
        });
    }

    private getReturnUrl(): void {
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    }

    onSubmit(): void {
        if (this.loginForm.valid) {
            this.isLoading = true;

            const loginData = {
                email: this.loginForm.value.email,
                password: this.loginForm.value.password
            };

            this.authService.login(loginData)
                .pipe(
                    takeUntil(this.destroy$),
                    finalize(() => this.isLoading = false)
                )
                .subscribe({
                    next: (result) => {
                        if (result.success) {
                            this.router.navigateByUrl(this.returnUrl);
                        }
                    },
                    error: (error) => {
                        console.error('Login error:', error);
                        // Error handling is done in the service with toastr
                    }
                });
        } else {
            this.markFormGroupTouched();
        }
    }

    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }

    navigateToRegister(): void {
        this.router.navigate(['/auth/register'], {
            queryParams: { returnUrl: this.returnUrl }
        });
    }

    // Helper methods
    isFieldInvalid(fieldName: string): boolean {
        const field = this.loginForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    getFieldError(fieldName: string): string {
        const field = this.loginForm.get(fieldName);
        if (field && field.errors && (field.dirty || field.touched)) {
            if (field.errors['required']) {
                return this.languageService.translate(`auth.${fieldName}`) + ' is required';
            }
            if (field.errors['email']) {
                return 'Please enter a valid email address';
            }
            if (field.errors['minlength']) {
                return `Password must be at least ${field.errors['minlength'].requiredLength} characters`;
            }
        }
        return '';
    }

    private markFormGroupTouched(): void {
        Object.keys(this.loginForm.controls).forEach(key => {
            const control = this.loginForm.get(key);
            control?.markAsTouched();
        });
    }

    // Quick demo login (for development/demo purposes)
    quickLogin(userType: 'demo'): void {
        if (userType === 'demo') {
            this.loginForm.patchValue({
                email: 'demo@prepwise.com',
                password: 'demo123'
            });
        }
    }
} 