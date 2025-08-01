import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, AuthResult, LoginRequest, RegisterRequest } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) {
        this.loadStoredUser();
    }

    private loadStoredUser(): void {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                this.currentUserSubject.next(user);
            } catch (error) {
                localStorage.removeItem('currentUser');
            }
        }
    }

    login(credentials: LoginRequest): Observable<AuthResult> {
        const graphqlQuery = {
            query: `
                mutation Login($email: String!, $password: String!) {
                    login(email: $email, password: $password) {
                        success
                        message
                        token
                        user {
                            id
                            email
                            firstName
                            lastName
                        }
                    }
                }
            `,
            variables: {
                email: credentials.email,
                password: credentials.password
            }
        };

        return this.http.post<any>(`${environment.apiUrl}/graphql`, graphqlQuery)
            .pipe(
                map(response => {
                    const result = response.data?.login || { success: false, message: 'Login failed' };
                    if (result.success && result.user) {
                        this.setCurrentUser(result.user);
                        if (result.token) {
                            localStorage.setItem('token', result.token);
                        }
                    }
                    return result;
                }),
                catchError(error => {
                    console.error('Login error:', error);
                    return of({ success: false, message: 'Login failed. Please try again.' });
                })
            );
    }

    register(userData: RegisterRequest): Observable<AuthResult> {
        const graphqlQuery = {
            query: `
                mutation Register($email: String!, $password: String!, $firstName: String!, $lastName: String!, $phoneNumber: String) {
                    register(email: $email, password: $password, firstName: $firstName, lastName: $lastName, phoneNumber: $phoneNumber) {
                        success
                        message
                        token
                        user {
                            id
                            email
                            firstName
                            lastName
                        }
                    }
                }
            `,
            variables: {
                email: userData.email,
                password: userData.password,
                firstName: userData.firstName,
                lastName: userData.lastName,
                phoneNumber: userData.phoneNumber
            }
        };

        return this.http.post<any>(`${environment.apiUrl}/graphql`, graphqlQuery)
            .pipe(
                map(response => {
                    const result = response.data?.register || { success: false, message: 'Registration failed' };
                    if (result.success && result.user) {
                        this.setCurrentUser(result.user);
                        if (result.token) {
                            localStorage.setItem('token', result.token);
                        }
                    }
                    return result;
                }),
                catchError(error => {
                    console.error('Registration error:', error);
                    return of({ success: false, message: 'Registration failed. Please try again.' });
                })
            );
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }

    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }

    isAuthenticated(): boolean {
        return !!this.getCurrentUser();
    }

    isLoggedIn(): boolean {
        return this.isAuthenticated();
    }

    private setCurrentUser(user: User): void {
        this.currentUserSubject.next(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    // Mock data for development
    private getMockAuthResult(): AuthResult {
        return {
            success: true,
            message: 'Login successful',
            token: 'mock-jwt-token',
            user: {
                id: 1,
                email: 'user@example.com',
                firstName: 'John',
                lastName: 'Doe',
                phoneNumber: '+1234567890',
                createdAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString(),
                isActive: true
            }
        };
    }
} 