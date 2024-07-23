import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Employee } from '../models/employee.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private baseUrl = 'http://localhost:8081/api/v1/employees';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getAllEmployees(): Observable<Employee[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Employee[]>(`${this.baseUrl}/data`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  createEmployee(employee: Employee): Observable<Employee> {
    const headers = this.getAuthHeaders();
    return this.http.post<Employee>(`${this.baseUrl}/cont/add`, employee, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  updateEmployee(id: number, employee: Employee): Observable<Employee> {
    const headers = this.getAuthHeaders();
    return this.http.put<Employee>(`${this.baseUrl}/cont/${id}`, employee, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  deleteEmployee(id: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.baseUrl}/cont/${id}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('An error occurred', error);
    return throwError(() => new Error('Something went wrong; please try again later.'));
  }
}
