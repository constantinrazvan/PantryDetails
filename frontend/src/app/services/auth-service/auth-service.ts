import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/api-response';
import { CurrentUser } from '../../models/current-user';
import { UserRole } from '../../models/user-role';

@Service()
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private baseUrl = environment.apiUrl + '/auth';

  getToken(): string | null {
    return localStorage.getItem(environment.tokenKey);
  }

  user(): CurrentUser | null {
    const payload = this.readPayload();
    if (!payload) return null;
    return { id: payload.sub, email: payload.email, role: payload.role };
  }

  isAdmin(): boolean {
    const user = this.user();
    return user !== null && user.role === UserRole.ADMIN;
  }

  mustChangePassword(): boolean {
    const payload = this.readPayload();
    return payload !== null && payload.mustChangePassword === true;
  }

  isLoggedIn(): boolean {
    const payload = this.readPayload();
    return payload !== null && payload.exp * 1000 > Date.now();
  }

  login(email: string, password: string): Observable<any> {
    return this.http
      .post<ApiResponse<any>>(this.baseUrl + '/login', { email, password })
      .pipe(tap((res) => this.saveToken(res.data.token)));
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(this.baseUrl + '/forgot-password', { email });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(this.baseUrl + '/reset-password', { token, password });
  }

  saveToken(token: string): void {
    localStorage.setItem(environment.tokenKey, token);
  }

  logout(): void {
    localStorage.removeItem(environment.tokenKey);
    this.router.navigate(['/login']);
  }

  private readPayload(): any {
    const token = this.getToken();
    if (!token) return null;

    // the middle part of the JWT token has the user data
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(base64));
    } catch {
      return null;
    }
  }
}
