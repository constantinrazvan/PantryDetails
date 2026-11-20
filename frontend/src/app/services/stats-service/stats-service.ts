import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/api-response';
import { DashboardStats } from '../../models/dashboard-stats';

@Service()
export class StatsService {
  private http = inject(HttpClient);

  overview(): Observable<DashboardStats> {
    return this.http.get<ApiResponse<DashboardStats>>(`${environment.apiUrl}/stats`).pipe(map((res) => res.data));
  }
}
