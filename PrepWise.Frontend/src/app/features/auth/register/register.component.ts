import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { AuthService } from '../../../core/services/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {
    registerForm!: FormGroup;
    isLoading = false;
    showPassword = false;
    showConfirmPassword = false;
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
        this.registerForm = this.formBuilder.group({
            firstName: ['', [Validators.required, Validators.minLength(2)]],
            lastName: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
            phoneNumber: ['', [Validators.pattern(/^[0-9]{10}$/)]],
            password: ['', [Validators.required, Validators.minLength(6), this.passwordValidator]],
            confirmPassword: ['', [Validators.required]],
            agreeToTerms: [false, [Validators.requiredTrue]]
        }, {
            validators: this.passwordMatchValidator
        });
    }

    private getReturnUrl(): void {
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    }

    onSubmit(): void {
        if (this.registerForm.valid) {
            this.isLoading = true;

            const registerData = {
                firstName: this.registerForm.value.firstName,
                lastName: this.registerForm.value.lastName,
                email: this.registerForm.value.email,
                phoneNumber: this.registerForm.value.phoneNumber || undefined,
                password: this.registerForm.value.password
            };

            this.authService.register(registerData)
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
                        console.error('Registration error:', error);
                        // Error handling is done in the service with toastr
                    }
                });
        } else {
            this.markFormGroupTouched();
        }
    }

    togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
        if (field === 'password') {
            this.showPassword = !this.showPassword;
        } else {
            this.showConfirmPassword = !this.showConfirmPassword;
        }
    }

    navigateToLogin(): void {
        this.router.navigate(['/auth/login'], {
            queryParams: { returnUrl: this.returnUrl }
        });
    }

    // Custom Validators
    private passwordValidator(control: AbstractControl): { [key: string]: any } | null {
        const value = control.value;
        if (!value) return null;

        const hasNumber = /[0-9]/.test(value);
        const hasLetter = /[a-zA-Z]/.test(value);
        const hasMinLength = value.length >= 6;

        if (hasNumber && hasLetter && hasMinLength) {
            return null;
        }

        return {
            passwordStrength: {
                hasNumber,
                hasLetter,
                hasMinLength
            }
        };
    }

    private passwordMatchValidator(group: AbstractControl): { [key: string]: any } | null {
        const password = group.get('password');
        const confirmPassword = group.get('confirmPassword');

        if (!password || !confirmPassword) return null;

        return password.value === confirmPassword.value ? null : { passwordMismatch: true };
    }

    // Helper methods
    isFieldInvalid(fieldName: string): boolean {
        const field = this.registerForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    getFieldError(fieldName: string): string {
        const field = this.registerForm.get(fieldName);
        if (field && field.errors && (field.dirty || field.touched)) {
            if (field.errors['required']) {
                return this.languageService.translate(`auth.${fieldName}`) + ' is required';
            }
            if (field.errors['email']) {
                return 'Please enter a valid email address';
            }
            if (field.errors['minlength']) {
                return `Minimum ${field.errors['minlength'].requiredLength} characters required`;
            }
            if (field.errors['pattern']) {
                return 'Please enter a valid 10-digit phone number';
            }
            if (field.errors['requiredTrue']) {
                return 'You must agree to the terms and conditions';
            }
            if (field.errors['passwordStrength']) {
                return 'Password must contain at least one letter and one number';
            }
        }

        // Check for password mismatch error
        if (fieldName === 'confirmPassword' && this.registerForm.errors?.['passwordMismatch']) {
            return 'Passwords do not match';
        }

        return '';
    }

    private markFormGroupTouched(): void {
        Object.keys(this.registerForm.controls).forEach(key => {
            const control = this.registerForm.get(key);
            control?.markAsTouched();
        });
    }

    // Password strength helper
    getPasswordStrength(): { score: number; text: string; color: string } {
        const password = this.registerForm.get('password')?.value || '';
        let score = 0;

        if (password.length >= 6) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (score <= 2) return { score, text: 'Weak', color: 'danger' };
        if (score <= 3) return { score, text: 'Medium', color: 'warning' };
        return { score, text: 'Strong', color: 'success' };
    }

    // Generate username suggestion from name
    generateEmailSuggestion(): void {
        const firstName = this.registerForm.get('firstName')?.value?.toLowerCase() || '';
        const lastName = this.registerForm.get('lastName')?.value?.toLowerCase() || '';

        if (firstName && lastName) {
            const suggestion = `${firstName}.${lastName}@gmail.com`;
            this.registerForm.get('email')?.setValue(suggestion);
        }
    }
} 