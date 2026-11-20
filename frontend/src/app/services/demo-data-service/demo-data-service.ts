import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/api-response';

@Service()
export class DemoDataService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl + '/settings/demo-data';

  hasDemoData(): Observable<boolean> {
    return this.http
      .get<ApiResponse<{ hasDemoData: boolean }>>(this.baseUrl)
      .pipe(map((res) => res.data.hasDemoData));
  }

  import(): Observable<any> {
    return this.http.post(this.baseUrl, {});
  }

  delete(): Observable<any> {
    return this.http.delete(this.baseUrl);
  }
}
