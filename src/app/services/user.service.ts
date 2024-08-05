import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
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
    switch (roleName) {
      case "user":
          roleName = "USER"
          break;
      case "superAdmin":
          roleName = "SUPER_ADMIN"
          break;
      case "staffAdmin":
          roleName = "STAFF_ADMIN"
          break;
      case "controlAdmin":
        roleName = "CONTROL_ADMIN"
        break;
      default:
        break;
    }
    
    return this.http.put<any>(`${this.apiUrl}/users/roles/${userId}`, 
      { roleName, id: userId }, // Send as a role update
      { headers: this.getAuthHeaders() }
    );
  }
}
