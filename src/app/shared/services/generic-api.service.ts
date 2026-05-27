import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class GenericApiService {

  constructor(private http: HttpClient) {}

  getAll<T>(endpoint: string) {
    return this.http.get<T[]>(endpoint);
  }

  create<T>(endpoint: string, body: T) {
    return this.http.post<T>(endpoint, body);
  }

  update<T>(endpoint: string, id: string, body: T) {
    return this.http.put<T>(`${endpoint}/${id}`, body);
  }

  delete(endpoint: string, id: string) {
    return this.http.delete(`${endpoint}/${id}`);
  }

  bulkDelete(endpoint: string, ids: string[]) {
    return this.http.post(`${endpoint}/bulk-delete`, { ids });
  }
}