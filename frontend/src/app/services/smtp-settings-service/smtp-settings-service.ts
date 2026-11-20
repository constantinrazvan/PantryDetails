import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/api-response';
import { SmtpSettings } from '../../models/smtp-settings';

@Service()
export class SmtpSettingsService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl + '/settings/smtp';

  get(): Observable<SmtpSettings> {
    return this.http.get<ApiResponse<SmtpSettings>>(this.baseUrl).pipe(map((res) => res.data));
  }

  update(data: any): Observable<SmtpSettings> {
    return this.http.put<ApiResponse<SmtpSettings>>(this.baseUrl, data).pipe(map((res) => res.data));
  }

  test(): Observable<any> {
    return this.http.post(this.baseUrl + '/test', {});
  }
}
