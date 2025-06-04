import { Routes } from '@angular/router';
import { SignInComponent } from './sign-in/sign-in.component';
import { CalendarComponent } from './calendar/calendar.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { authGuard } from './auth.guard';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { MessengerComponent } from './messenger/messenger.component';


export const routes: Routes = [
    { path: 'sign-in', component: SignInComponent },
    {
        path: '',
        component: AdminLayoutComponent,
        canActivate: [authGuard],
        children: [
            
            { path: 'dashboard', component: DashboardComponent },
            { path: 'calendar', component: CalendarComponent },
            { path: 'messenger', component: MessengerComponent },
        ]
    },
    // { path: '**', redirectTo: 'signin' }
];
