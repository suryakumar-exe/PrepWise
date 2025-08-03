import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LoadingService {
    private loadingSubject = new BehaviorSubject<boolean>(false);
    private loadingCounter = 0;

    public loading$ = this.loadingSubject.asObservable();

    setLoading(loading: boolean): void {
        if (loading) {
            this.loadingCounter++;
        } else {
            this.loadingCounter--;
        }

        // Only emit false when all requests are complete
        this.loadingSubject.next(this.loadingCounter > 0);
    }

    isLoading(): boolean {
        return this.loadingSubject.value;
    }
} 