import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { AnalyticsComponent } from './analytics/analytics.component';

const routes: Routes = [
    {
        path: '',
        component: AnalyticsComponent
    }
];

@NgModule({
    declarations: [
        AnalyticsComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        RouterModule.forChild(routes)
    ]
})
export class AnalyticsModule { } 