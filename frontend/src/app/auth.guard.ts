import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanMatchFn = (route, segments) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.checkAuth().pipe(
    map(isAuthenticated => {
      if (!isAuthenticated) {
        router.navigate(['/sign-in']);
        return false;
      }
      return true;
    }),
    catchError(error => {
      console.error(error);
      router.navigate(['/sign-in']);
      return of(false);
    })
  );
};
