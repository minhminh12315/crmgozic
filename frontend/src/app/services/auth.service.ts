// src/app/services/auth.service.ts
import { Injectable, inject, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

interface User {
    id: number;
    username: string;
}

interface LoginResponse {
    access_token: string;
    refresh_token: string;
    userID: number;
    username: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly apiUrl = "http://127.0.0.1:8000/api";
    private readonly tokenKey = 'access_token';
    private readonly refreshTokenKey = 'refresh_token';

    private http = inject(HttpClient);
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    currentUser$ = this.currentUserSubject.asObservable();
    private isBrowser: boolean;

    constructor(@Inject(PLATFORM_ID) platformId: Object) {
        this.isBrowser = isPlatformBrowser(platformId);
        // Check if user is already logged in
        if (this.isBrowser) {
            const token = localStorage.getItem(this.tokenKey);
            if (token) {
                this.checkAuth().subscribe();
            }
        }
    }

    /**
     * Gọi backend để kiểm tra session/cookie còn hợp lệ không
     * Trả về Observable<boolean> để guard subscribe
     */
    checkAuth(): Observable<boolean> {
        console.log('Checking authentication status...');
        return this.http
            .get<User>(
                `${this.apiUrl}/me/`,
                {
                    headers: {
                        Authorization: `Bearer ${this.getToken()}`
                    }
                }
            )
            .pipe(
                tap(user => {
                    console.log('User is authenticated:', user);
                    this.currentUserSubject.next(user);
                }),
                map(() => true),
                catchError(err => {
                    console.error('Auth check error', err);
                    this.currentUserSubject.next(null);
                    this.clearTokens();
                    return of(false);
                })
            );
    }

    /**
     * Đăng nhập và lưu JWT token
     */
    login(username: string, password: string): Observable<void> {
        console.log('Attempting login for user:', username);
        return this.http
            .post<LoginResponse>(
                `${this.apiUrl}/login/`,
                { username, password }
            ).pipe(
                tap(response => {
                    if (this.isBrowser) {
                        // Save tokens
                        localStorage.setItem(this.tokenKey, response.access_token);
                        localStorage.setItem(this.refreshTokenKey, response.refresh_token);
                    }

                    // Update current user
                    this.currentUserSubject.next({
                        id: response.userID,
                        username: response.username
                    });
                }),
                map(() => void 0)
            );
    }

    /**
     * Logout và xóa tokens
     */
    logout(): Observable<void> {
        console.log('Logging out current user:', this.getCurrentUser());
        const refreshToken = this.isBrowser ? localStorage.getItem(this.refreshTokenKey) : null;

        if (!refreshToken) {
            // Nếu không có refresh token, chỉ xóa local data
            this.clearTokens();
            this.currentUserSubject.next(null);
            return of(void 0);
        }

        return this.http
            .post<void>(
                `${this.apiUrl}/logout/`,
                { refresh_token: refreshToken },
                {
                    headers: {
                        Authorization: `Bearer ${this.getToken()}`
                    }
                }
            ).pipe(
                tap(() => {
                    this.clearTokens();
                    this.currentUserSubject.next(null);
                    console.log('User logged out successfully');
                })
            );
    }

    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }

    getToken(): string | null {
        return this.isBrowser ? localStorage.getItem(this.tokenKey) : null;
    }

    private clearTokens(): void {
        if (this.isBrowser) {
            localStorage.removeItem(this.tokenKey);
            localStorage.removeItem(this.refreshTokenKey);
        }
    }
}