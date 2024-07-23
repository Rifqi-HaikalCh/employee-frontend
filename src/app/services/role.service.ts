import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface UserRole {
  user: boolean;
  superAdmin: boolean;
  staffAdmin: boolean;
  controlAdmin: boolean;
}

export interface UserElement {
  id: number;
  username: string;
  roles: UserRole;
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private baseUrl = 'http://localhost:8081/api/v1/roles';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getAllUsers(): Observable<UserElement[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<UserElement[]>(`${this.baseUrl}/users`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  updateUserRole(id: number, roleId: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.put<void>(`${this.baseUrl}/users/${id}/role?roleId=${roleId}`, {}, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('An error occurred', error);
    return throwError(() => new Error('Something went wrong; please try again later.'));
  }
}
