import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';
import { User, AuthResult, LoginRequest, RegisterRequest } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

    private apiUrl = environment.apiUrl;

    constructor(
        private http: HttpClient,
        private router: Router,
        private toastr: ToastrService
    ) {
        this.initializeAuth();
    }

    private initializeAuth(): void {
        const token = this.getToken();
        const user = this.getStoredUser();

        if (token && user) {
            this.currentUserSubject.next(user);
            this.isAuthenticatedSubject.next(true);
        }
    }

    login(credentials: LoginRequest): Observable<AuthResult> {
        return this.http.post<AuthResult>(`${this.apiUrl}/api/auth/login`, credentials)
            .pipe(
                catchError(error => {
                    console.error('Login error:', error);
                    return of({
                        success: false,
                        message: 'Login failed. Please try again.',
                        token: undefined,
                        user: undefined
                    });
                }),
                tap(authResult => {
                    if (authResult.success && authResult.token && authResult.user) {
                        this.setAuthData(authResult.token, authResult.user);
                        this.toastr.success('Welcome back!', 'Login Successful');
                        this.router.navigate(['/dashboard']);
                    } else {
                        this.toastr.error(authResult.message, 'Login Failed');
                    }
                })
            );
    }

    register(userData: RegisterRequest): Observable<AuthResult> {
        return this.http.post<AuthResult>(`${this.apiUrl}/api/auth/register`, userData)
            .pipe(
                catchError(error => {
                    console.error('Registration error:', error);
                    return of({
                        success: false,
                        message: 'Registration failed. Please try again.',
                        token: undefined,
                        user: undefined
                    });
                }),
                tap(authResult => {
                    if (authResult.success && authResult.token && authResult.user) {
                        this.setAuthData(authResult.token, authResult.user);
                        this.toastr.success('Account created successfully!', 'Registration Successful');
                        this.router.navigate(['/dashboard']);
                    } else {
                        this.toastr.error(authResult.message, 'Registration Failed');
                    }
                })
            );
    }

    logout(): void {
        this.clearAuthData();
        this.toastr.info('You have been logged out', 'Goodbye!');
        this.router.navigate(['/auth/login']);
    }

    private setAuthData(token: string, user: User): void {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('current_user', JSON.stringify(user));
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
    }

    private clearAuthData(): void {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user');
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
    }

    getToken(): string | null {
        return localStorage.getItem('auth_token');
    }

    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }

    private getStoredUser(): User | null {
        const userStr = localStorage.getItem('current_user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch {
                return null;
            }
        }
        return null;
    }

    isLoggedIn(): boolean {
        return !!this.getToken() && !!this.getCurrentUser();
    }

    // Check if token is expired (basic check - in production, verify with backend)
    isTokenExpired(): boolean {
        const token = this.getToken();
        if (!token) return true;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const exp = payload.exp * 1000; // Convert to milliseconds
            return Date.now() >= exp;
        } catch {
            return true;
        }
    }

    refreshTokenIfNeeded(): void {
        if (this.isTokenExpired()) {
            this.logout();
        }
    }
} 