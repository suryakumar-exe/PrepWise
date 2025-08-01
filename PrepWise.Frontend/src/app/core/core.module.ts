import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';

// Services
import { QuizService } from './services/quiz.service';
import { MockTestService } from './services/mock-test.service';
import { ChatService } from './services/chat.service';
import { AnalyticsService } from './services/analytics.service';
import { LanguageService } from './services/language.service';
import { LoadingService } from './services/loading.service';

@NgModule({
    declarations: [],
    imports: [
        CommonModule
    ],
    providers: [
        // Services
        QuizService,
        MockTestService,
        ChatService,
        AnalyticsService,
        LanguageService,
        LoadingService
    ]
})
export class CoreModule {
    constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
        if (parentModule) {
            throw new Error('CoreModule is already loaded. Import only once in AppModule.');
        }
    }
} 