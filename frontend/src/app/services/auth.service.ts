// src/app/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    // nếu bạn để base URL trong environment
    private readonly apiUrl = "http://127.0.0.1:8000";

    // inject HttpClient (không dùng constructor để dễ xài trong CanMatchFn)
    private http = inject(HttpClient);

    /**
     * Gọi backend để kiểm tra session/cookie còn hợp lệ không
     * Trả về Observable<boolean> để guard subscribe
     */
    checkAuth(): Observable<boolean> {
        return this.http
            .get<{ authenticated: boolean }>(
                `${this.apiUrl}/api/auth/check-auth`,
                { withCredentials: true }
            )
            .pipe(
                // chuyển payload thành đúng boolean
                map(resp => !!resp.authenticated),
                // nếu gặp lỗi (401, 500, network…), mặc định redirect về signin
                catchError(err => {
                    console.error('Auth check error', err);
                    return of(false);
                })
            );
    }

    /**
     * Đăng nhập, backend trả 200 + set cookie HttpOnly
     * Nếu dùng JWT-cookie, bạn cũng không cần lưu token thủ công
     */
    login(username: string, password: string): Observable<void> {
        return this.http
            .post<void>(
                `${this.apiUrl}/api/auth/signin`,
                { username, password },
                { withCredentials: true }
            );
    }

    /**
     * Logout tại backend (xoá session trên Redis),
     * backend set cookie về expired
     */
    logout(): Observable<void> {
        return this.http
            .post<void>(
                `${this.apiUrl}/api/v1/auth/signout`,
                {},
                { withCredentials: true }
            );
    }
}