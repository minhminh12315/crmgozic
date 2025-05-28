import { Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { CalendarComponent } from './calendar/calendar.component';

export const routes: Routes = [
    { path: '', component: HomePageComponent },
    { path: 'sign-in', component: SignInComponent },
    { path: 'calendar', component: CalendarComponent },
];
