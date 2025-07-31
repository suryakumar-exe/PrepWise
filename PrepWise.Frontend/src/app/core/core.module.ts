import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

// Services
import { AuthService } from './services/auth.service';
import { QuizService } from './services/quiz.service';
import { MockTestService } from './services/mock-test.service';
import { ChatService } from './services/chat.service';
import { AnalyticsService } from './services/analytics.service';
import { LanguageService } from './services/language.service';
import { LoadingService } from './services/loading.service';

// Guards
import { AuthGuard } from './guards/auth.guard';

// Interceptors
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { LoadingInterceptor } from './interceptors/loading.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';

@NgModule({
    declarations: [],
    imports: [
        CommonModule
    ],
    providers: [
        // Services
        AuthService,
        QuizService,
        MockTestService,
        ChatService,
        AnalyticsService,
        LanguageService,
        LoadingService,

        // Guards
        AuthGuard,

        // Interceptors
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: LoadingInterceptor,
            multi: true
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: ErrorInterceptor,
            multi: true
        }
    ]
})
export class CoreModule {
    constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
        if (parentModule) {
            throw new Error('CoreModule is already loaded. Import only once in AppModule.');
        }
    }
} 