import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/api-response';
import { Folder } from '../../models/folder';

@Service()
export class FolderService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl + '/folders';

  vaults: Folder[] = [];
  loading = false;
  error = '';

  load(): void {
    this.loading = true;
    this.error = '';
    this.list().subscribe({
      next: (folders) => {
        this.vaults = folders;
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not load the vaults';
        this.loading = false;
      },
    });
  }

  reset(): void {
    this.vaults = [];
    this.error = '';
  }

  list(): Observable<Folder[]> {
    return this.http.get<ApiResponse<Folder[]>>(this.baseUrl).pipe(map((res) => res.data));
  }

  get(id: number | string): Observable<Folder> {
    return this.http.get<ApiResponse<Folder>>(this.baseUrl + '/' + id).pipe(map((res) => res.data));
  }

  create(data: { name: string; description: string | null }): Observable<Folder> {
    return this.http.post<ApiResponse<Folder>>(this.baseUrl, data).pipe(map((res) => res.data));
  }

  update(id: number | string, data: { name: string; description: string | null }): Observable<Folder> {
    return this.http.patch<ApiResponse<Folder>>(this.baseUrl + '/' + id, data).pipe(map((res) => res.data));
  }

  delete(id: number | string): Observable<any> {
    return this.http.delete(this.baseUrl + '/' + id);
  }
}
