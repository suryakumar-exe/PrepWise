import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LanguageService, Language, LanguageConfig } from '../../../core/services/language.service';

@Component({
    selector: 'app-language-switcher',
    templateUrl: './language-switcher.component.html',
    styleUrls: ['./language-switcher.component.css']
})
export class LanguageSwitcherComponent implements OnInit, OnDestroy {
    currentLanguage: Language = 'en';
    availableLanguages: LanguageConfig[] = [];
    isOpen = false;
    private destroy$ = new Subject<void>();

    constructor(private languageService: LanguageService) { }

    ngOnInit(): void {
        this.availableLanguages = this.languageService.languages;

        // Subscribe to language changes
        this.languageService.currentLanguage$
            .pipe(takeUntil(this.destroy$))
            .subscribe(language => {
                this.currentLanguage = language;
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    toggleDropdown(): void {
        this.isOpen = !this.isOpen;
    }

    selectLanguage(language: Language): void {
        this.languageService.setLanguage(language);
        this.isOpen = false;
    }

    getCurrentLanguageConfig(): LanguageConfig | undefined {
        return this.languageService.getLanguageConfig(this.currentLanguage);
    }

    onDocumentClick(event: Event): void {
        // Close dropdown if clicked outside
        const target = event.target as HTMLElement;
        if (!target.closest('.language-switcher')) {
            this.isOpen = false;
        }
    }
} 