import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(
        private toastr: ToastrService,
        private authService: AuthService,
        private router: Router
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                let errorMessage = 'An unexpected error occurred';

                if (error.error instanceof ErrorEvent) {
                    // Client-side error
                    errorMessage = error.error.message;
                } else {
                    // Server-side error
                    switch (error.status) {
                        case 401:
                            errorMessage = 'Unauthorized. Please log in again.';
                            this.authService.logout();
                            break;
                        case 403:
                            errorMessage = 'Access forbidden.';
                            break;
                        case 404:
                            errorMessage = 'Resource not found.';
                            break;
                        case 500:
                            errorMessage = 'Internal server error. Please try again later.';
                            break;
                        default:
                            if (error.error?.message) {
                                errorMessage = error.error.message;
                            } else if (error.message) {
                                errorMessage = error.message;
                            }
                            break;
                    }
                }

                // Show error toast (except for 401 as logout already shows a message)
                if (error.status !== 401) {
                    this.toastr.error(errorMessage, 'Error');
                }

                return throwError(() => error);
            })
        );
    }
} 