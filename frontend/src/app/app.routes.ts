import { Routes } from '@angular/router';
import { SignInComponent } from './sign-in/sign-in.component';
import { CalendarComponent } from './calendar/calendar.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { authGuard } from './auth.guard';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { MessengerComponent } from './messenger/messenger.component';
import { ProjectComponent } from './project/project.component';
import { ProfileLayoutComponent } from './profile/profile-layout/profile-layout.component';
import { ProfileProjectComponent } from './profile/profile-project/profile-project.component';
import { ProfileTeamComponent } from './profile/profile-team/profile-team.component';
import { ProfileVacationComponent } from './profile/profile-vacation/profile-vacation.component';
import { ProfileSettingComponent } from './profile/profile-setting/profile-setting.component';


export const routes: Routes = [
    { path: 'sign-in', component: SignInComponent },
    {
        path: '',
        component: AdminLayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'projects', component: ProjectComponent },
            {
                path: 'profile',
                component: ProfileLayoutComponent,
                children: [
                    { path: '', redirectTo: 'projects', pathMatch: 'full' }, 
                    { path: 'projects', component: ProfileProjectComponent },
                    { path: 'team', component: ProfileTeamComponent},
                    { path: 'vacations', component: ProfileVacationComponent },
                    { path: 'setting', component: ProfileSettingComponent },
                ]
            },
            { path: 'dashboard', component: DashboardComponent },
            { path: 'calendar', component: CalendarComponent },
            { path: 'messenger', component: MessengerComponent },
        ]
    },
    // { path: '**', redirectTo: 'sign-in', pathMatch: 'full' }
];

