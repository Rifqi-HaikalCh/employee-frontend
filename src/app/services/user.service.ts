import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  getUser(id: number) {
    throw new Error('Method not implemented.');
  }

  private apiUrl = 'http://localhost:8081/api/v1/roles'; // Adjust URL based on your backend

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getAllUsers(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users`, { headers: this.getAuthHeaders() });
  }

  updateUserRole(userId: number, roleName: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/users/${userId}/role`, {}, {
      headers: this.getAuthHeaders(),
      params: { roleName }
    });
  }
}
