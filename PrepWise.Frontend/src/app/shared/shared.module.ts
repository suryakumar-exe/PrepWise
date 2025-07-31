import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Shared Components
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { TimerComponent } from './components/timer/timer.component';
import { QuestionCardComponent } from './components/question-card/question-card.component';
import { ScoreCardComponent } from './components/score-card/score-card.component';
import { LanguageSwitcherComponent } from './components/language-switcher/language-switcher.component';

// Shared Directives
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { AutoFocusDirective } from './directives/auto-focus.directive';

// Shared Pipes
import { TimeFormatPipe } from './pipes/time-format.pipe';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { TruncatePipe } from './pipes/truncate.pipe';

const COMPONENTS = [
    LoadingSpinnerComponent,
    ConfirmDialogComponent,
    TimerComponent,
    QuestionCardComponent,
    ScoreCardComponent,
    LanguageSwitcherComponent
];

const DIRECTIVES = [
    ClickOutsideDirective,
    AutoFocusDirective
];

const PIPES = [
    TimeFormatPipe,
    SafeHtmlPipe,
    TruncatePipe
];

const MODULES = [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
];

@NgModule({
    declarations: [
        ...COMPONENTS,
        ...DIRECTIVES,
        ...PIPES
    ],
    imports: [
        ...MODULES
    ],
    exports: [
        ...MODULES,
        ...COMPONENTS,
        ...DIRECTIVES,
        ...PIPES
    ]
})
export class SharedModule { } 