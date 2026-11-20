import { HttpClient, HttpParams } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/api-response';
import { CreatedUser } from '../../models/created-user';
import { UserProfile } from '../../models/user-profile';
import { AuthService } from '../auth-service/auth-service';

@Service()
export class UserService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private baseUrl = environment.apiUrl + '/users';

  me(): Observable<UserProfile> {
    return this.http.get<ApiResponse<UserProfile>>(this.baseUrl + '/me').pipe(map((res) => res.data));
  }

  updateProfile(firstName: string, lastName: string): Observable<UserProfile> {
    return this.http
      .patch<ApiResponse<UserProfile>>(this.baseUrl + '/me', { firstName, lastName })
      .pipe(map((res) => res.data));
  }

  changeEmail(email: string): Observable<UserProfile> {
    return this.http.patch<ApiResponse<UserProfile>>(this.baseUrl + '/me/email', { email }).pipe(map((res) => res.data));
  }

  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http
      .patch<ApiResponse<{ token: string }>>(this.baseUrl + '/me/password', { oldPassword, newPassword })
      .pipe(tap((res) => this.auth.saveToken(res.data.token)));
  }

  create(data: any): Observable<CreatedUser> {
    return this.http.post<ApiResponse<CreatedUser>>(this.baseUrl, data).pipe(map((res) => res.data));
  }

  update(id: number, data: any): Observable<UserProfile> {
    return this.http.patch<ApiResponse<UserProfile>>(this.baseUrl + '/' + id, data).pipe(map((res) => res.data));
  }

  delete(id: number): Observable<any> {
    return this.http.delete(this.baseUrl + '/' + id);
  }

  search(search: string, access: string, role: string, status: string): Observable<UserProfile[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (access) params = params.set('access', access);
    if (role) params = params.set('role', role);
    if (status) params = params.set('status', status);

    return this.http.get<ApiResponse<UserProfile[]>>(this.baseUrl, { params }).pipe(map((res) => res.data));
  }

  list(): Observable<UserProfile[]> {
    return this.search('', '', '', '');
  }
}
