import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { LeaderboardComponent } from './leaderboard/leaderboard.component';

const routes: Routes = [
    {
        path: '',
        component: LeaderboardComponent
    }
];

@NgModule({
    declarations: [
        LeaderboardComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild(routes)
    ]
})
export class LeaderboardModule { } 