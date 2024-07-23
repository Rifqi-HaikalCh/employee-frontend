import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccessService {

  private accessUrl = 'http://localhost:8081/api/v1/access'; // Ensure this matches your backend URL

  constructor(private http: HttpClient) { }

  getUserAccess(userId: number): Observable<Map<string, boolean>> {
    return this.http.get<Map<string, boolean>>(`${this.accessUrl}/${userId}`);
  }
}
