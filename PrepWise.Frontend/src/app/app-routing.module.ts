import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
    {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
    },
    {
        path: 'auth',
        loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
    },
    {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule),
        canActivate: [AuthGuard]
    },
    // Temporarily disabled until components are fully fixed
    /*
    {
        path: 'quiz',
        loadChildren: () => import('./features/quiz/quiz.module').then(m => m.QuizModule),
        canActivate: [AuthGuard]
    },
    {
        path: 'mock-test',
        loadChildren: () => import('./features/mock-test/mock-test.module').then(m => m.MockTestModule),
        canActivate: [AuthGuard]
    },
    {
        path: 'leaderboard',
        loadChildren: () => import('./features/leaderboard/leaderboard.module').then(m => m.LeaderboardModule),
        canActivate: [AuthGuard]
    },
    {
        path: 'chat',
        loadChildren: () => import('./features/chat/chat.module').then(m => m.ChatModule),
        canActivate: [AuthGuard]
    },
    {
        path: 'analytics',
        loadChildren: () => import('./features/analytics/analytics.module').then(m => m.AnalyticsModule),
        canActivate: [AuthGuard]
    },
    {
        path: 'profile',
        loadChildren: () => import('./features/profile/profile.module').then(m => m.ProfileModule),
        canActivate: [AuthGuard]
    },
    */
    {
        path: '**',
        redirectTo: '/dashboard'
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {
        enableTracing: false,
        scrollPositionRestoration: 'top'
    })],
    exports: [RouterModule]
})
export class AppRoutingModule { } 