import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { User } from '../models/user.model';
import { UserProfile } from '../models/user-profile.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8081/api/v1';
  private authUrl = 'http://localhost:8081/auth';
  private loggedInUser: User | null = null;
  private userAccess: Map<string, boolean> = new Map();

  constructor(private http: HttpClient) {
    this.initializeUser();
  }

  private initializeUser(): void {
    const user = localStorage.getItem('user');
    const userAccess = localStorage.getItem('userAccess');

    if (user) {
      try {
        this.loggedInUser = JSON.parse(user);
      } catch (e) {
        console.error('Error parsing user from localStorage', e);
        localStorage.removeItem('user');
      }
    }

    if (userAccess) {
      try {
        this.userAccess = new Map<string, boolean>(Object.entries(JSON.parse(userAccess)));
      } catch (e) {
        console.error('Error parsing userAccess from localStorage', e);
        localStorage.removeItem('userAccess');
      }
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  logout(): void {
    this.loggedInUser = null;
    this.userAccess.clear();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userAccess');
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getUserRole(): string | null {
    return this.loggedInUser?.role || null;
  }

  getUserId(): string | null {
    return this.loggedInUser?.id || null;
  }

  getUserAccess(): Map<string, boolean> {
    return this.userAccess;
  }

  fetchUserAccess(): Observable<Map<string, boolean>> {
    const userId = this.getUserId();
    if (!userId) {
      return of(new Map<string, boolean>());
    }
    return this.http.get<{ [key: string]: boolean }>(`${this.baseUrl}/access/${userId}`, { headers: this.getAuthHeaders() }).pipe(
      map(accessMap => new Map<string, boolean>(Object.entries(accessMap))),
      tap(accessMap => {
        this.userAccess = accessMap;
        localStorage.setItem('userAccess', JSON.stringify(Object.fromEntries(accessMap)));
      }),
      catchError(this.handleError)
    );
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/authenticate`, { username, password }).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        this.loggedInUser = response.user;
        localStorage.setItem('user', JSON.stringify(response.user));

        // Storing access data
        localStorage.setItem('userAccess', JSON.stringify(response.accessMap));
      }),
      catchError(this.handleError)
    );
  }

  register(username: string, email: string, password: string, confirmation: string): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/register`, { username, email, password, confirmation }).pipe(
      catchError(this.handleError)
    );
  }

  getUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/users/profile`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  updateUserProfile(user: User): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/users/profile`, user, { headers: this.getAuthHeaders() }).pipe(
      tap(updatedUser => {
        this.loggedInUser = updatedUser;
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }),
      catchError(this.handleError)
    );
  }

  deleteAccount(): Observable<void> {
    const userId = this.getUserId();
    if (!userId) {
      return throwError(() => new Error('User is not logged in'));
    }
    return this.http.delete<void>(`${this.baseUrl}/users/profile`, { headers: this.getAuthHeaders() }).pipe(
      tap(() => {
        this.logout();
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred', error);
    return throwError(() => new Error('Something went wrong; please try again later.'));
  }
}
