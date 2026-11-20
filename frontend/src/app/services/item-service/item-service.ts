import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/api-response';
import { Item } from '../../models/item';

@Service()
export class ItemService {
  private http = inject(HttpClient);

  private url(folderId: number | string): string {
    return environment.apiUrl + '/folders/' + folderId + '/items';
  }

  list(folderId: number | string): Observable<Item[]> {
    return this.http.get<ApiResponse<Item[]>>(this.url(folderId)).pipe(map((res) => res.data));
  }

  get(folderId: number | string, itemId: number | string): Observable<Item> {
    return this.http.get<ApiResponse<Item>>(this.url(folderId) + '/' + itemId).pipe(map((res) => res.data));
  }

  createNote(folderId: number | string, data: any): Observable<Item> {
    return this.http.post<ApiResponse<Item>>(this.url(folderId) + '/notes', data).pipe(map((res) => res.data));
  }

  createCredential(folderId: number | string, data: any): Observable<Item> {
    return this.http.post<ApiResponse<Item>>(this.url(folderId) + '/credentials', data).pipe(map((res) => res.data));
  }

  createFile(folderId: number | string, file: File, title: string): Observable<Item> {
    const form = new FormData();
    form.append('file', file);
    form.append('title', title);
    return this.http.post<ApiResponse<Item>>(this.url(folderId) + '/files', form).pipe(map((res) => res.data));
  }

  update(folderId: number | string, itemId: number | string, data: any): Observable<Item> {
    return this.http.patch<ApiResponse<Item>>(this.url(folderId) + '/' + itemId, data).pipe(map((res) => res.data));
  }

  delete(folderId: number | string, itemId: number | string): Observable<any> {
    return this.http.delete(this.url(folderId) + '/' + itemId);
  }

  reveal(folderId: number | string, itemId: number): Observable<string> {
    return this.http
      .post<ApiResponse<{ password: string }>>(this.url(folderId) + '/' + itemId + '/reveal', {})
      .pipe(map((res) => res.data.password));
  }

  download(folderId: number | string, itemId: number): Observable<Blob> {
    return this.http.get(this.url(folderId) + '/' + itemId + '/download', { responseType: 'blob' });
  }
}
