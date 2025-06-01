import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    private isBrowser: boolean;

    constructor(@Inject(PLATFORM_ID) platformId: Object) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!this.isBrowser) {
            return next.handle(request);
        }

        const token = localStorage.getItem('access_token');

        if (token) {
            // Clone the request and add the authorization header
            const authReq = request.clone({
                headers: request.headers.set('Authorization', `Bearer ${token}`)
            });
            return next.handle(authReq);
        }

        return next.handle(request);
    }
} 