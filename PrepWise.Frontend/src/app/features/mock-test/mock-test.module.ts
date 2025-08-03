import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';

import { MockTestStartComponent } from './mock-test-start/mock-test-start.component';
import { MockTestPlayComponent } from './mock-test-play/mock-test-play.component';
import { MockTestResultComponent } from './mock-test-result/mock-test-result.component';

const routes: Routes = [
    {
        path: '',
        component: MockTestStartComponent
    },
    {
        path: 'play',
        component: MockTestPlayComponent
    },
    {
        path: 'result',
        component: MockTestResultComponent
    }
];

@NgModule({
    declarations: [
        MockTestStartComponent,
        MockTestPlayComponent,
        MockTestResultComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        RouterModule.forChild(routes)
    ]
})
export class MockTestModule {
    constructor() {
        console.log('MockTestModule loaded successfully'); // Debug log
    }
} 