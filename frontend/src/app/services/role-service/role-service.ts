import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/api-response';
import { Role } from '../../models/role';

@Service()
export class RoleService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl + '/roles';

  list(): Observable<Role[]> {
    return this.http.get<ApiResponse<Role[]>>(this.baseUrl).pipe(map((res) => res.data));
  }

  icons(): Observable<string[]> {
    return this.http.get<ApiResponse<string[]>>(this.baseUrl + '/icons').pipe(map((res) => res.data));
  }

  create(data: any): Observable<Role> {
    return this.http.post<ApiResponse<Role>>(this.baseUrl, data).pipe(map((res) => res.data));
  }

  update(id: number, data: any): Observable<Role> {
    return this.http.patch<ApiResponse<Role>>(this.baseUrl + '/' + id, data).pipe(map((res) => res.data));
  }

  delete(id: number): Observable<any> {
    return this.http.delete(this.baseUrl + '/' + id);
  }
}
