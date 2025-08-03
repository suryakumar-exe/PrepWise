import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared.module';
import { QuizStartComponent } from './quiz-start/quiz-start.component';
import { QuizPlayComponent } from './quiz-play/quiz-play.component';
import { QuizResultComponent } from './quiz-result/quiz-result.component';
import { QuizLayoutComponent } from './quiz-layout/quiz-layout.component';

const routes: Routes = [
    {
        path: '',
        component: QuizLayoutComponent,
        children: [
            {
                path: '',
                component: QuizStartComponent
            },
            {
                path: 'start',
                component: QuizStartComponent
            },
            {
                path: 'play/:attemptId',
                component: QuizPlayComponent
            },
            {
                path: 'result/:attemptId',
                component: QuizResultComponent
            }
        ]
    }
];

@NgModule({
    declarations: [
        QuizLayoutComponent,
        QuizStartComponent,
        QuizPlayComponent,
        QuizResultComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        SharedModule,
        RouterModule.forChild(routes)
    ]
})
export class QuizModule { } 