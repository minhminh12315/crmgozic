import { Routes } from '@angular/router';
import { SignInComponent } from './sign-in/sign-in.component';
import { CalendarComponent } from './calendar/calendar.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'sign-in', component: SignInComponent },
    { path: 'calendar', component: CalendarComponent },
];
