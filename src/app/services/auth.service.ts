import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export interface UserRoleDto {
  id: number;
  username: string;
  roles: {
    user: boolean;
    superAdmin: boolean;
    staffAdmin: boolean;
    controlAdmin: boolean;
  };
}

export interface JwtResponse {
  authenticated: boolean;
  token: string;
  username: string;
  email: string;
  role: string;
  accessMap: { [key: string]: boolean };
}

export interface UserProfile {
  username: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8081/api/v1';
  private authUrl = 'http://localhost:8081/auth';
  private roleUrl = 'http://localhost:8081/api/v1/roles';
  private loggedInUser: UserRoleDto | null = null;
  private userAccess: Map<string, boolean> = new Map();
  private userProfile: UserProfile | null = null;

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
    if (!this.loggedInUser || !this.loggedInUser.roles) {
      return null;
    }

    if (this.loggedInUser.roles.superAdmin) {
      return 'SUPER_ADMIN';
    } else if (this.loggedInUser.roles.staffAdmin) {
      return 'STAFF_ADMIN';
    } else if (this.loggedInUser.roles.controlAdmin) {
      return 'CONTROL_ADMIN';
    } else if (this.loggedInUser.roles.user) {
      return 'USER';
    }

    return null;
  }

  getUserId(): number | null {
    return this.loggedInUser?.id || null;
  }

  getUserAccess(): Map<string, boolean> {
    return this.userAccess;
  }

  getUserPermissions(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
    return this.http.get<any>(`${this.baseUrl}/permissions`, { headers });
  }

  login(username: string, password: string): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${this.authUrl}/authenticate`, { username, password }).pipe(
      tap(response => {
        if (response.authenticated) {
          localStorage.setItem('token', response.token);
          this.loggedInUser = {
            id: 0, // Temporary until response includes ID
            username: username,
            roles: {
              user: response.role === 'USER',
              superAdmin: response.role === 'SUPER_ADMIN',
              staffAdmin: response.role === 'STAFF_ADMIN',
              controlAdmin: response.role === 'CONTROL_ADMIN'
            }
          };
          localStorage.setItem('user', JSON.stringify(this.loggedInUser));
          localStorage.setItem('userAccess', JSON.stringify(response.accessMap));
        } else {
          this.logout(); // Ensure logout on failed authentication
        }
      }),
      catchError(this.handleError<JwtResponse>('login'))
    );
  }

  register(username: string, email: string, password: string, confirmation: string): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/register`, { username, email, password, confirmation }).pipe(
      catchError(this.handleError<any>('register'))
    );
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/users/profile`, { headers: this.getAuthHeaders() }).pipe(
      tap(profile => this.userProfile = profile),
      catchError(this.handleError<UserProfile>('getUserProfile'))
    );
  }

  updateUserProfile(user: UserRoleDto): Observable<UserRoleDto> {
    return this.http.put<UserRoleDto>(`${this.baseUrl}/users/profile`, user, { headers: this.getAuthHeaders() }).pipe(
      tap(this.updateLoggedInUser.bind(this)),
      catchError(this.handleError<UserRoleDto>('updateUserProfile'))
    );
  }

  deleteAccount(): Observable<string> {
    return this.http.delete<string>(`${this.baseUrl}/users/profile`, { headers: this.getAuthHeaders() }).pipe(
      tap(() => this.logout()),
      catchError(this.handleError<string>('deleteAccount'))
    );
  }

  getUserProfileByUsername(username: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/access/profile/${username}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError<any>('getUserProfileByUsername'))
    );
  }

  getStoredUserProfile(): UserProfile | null {
    return this.userProfile;
  }

  private updateLoggedInUser(user: UserRoleDto): void {
    if (this.userProfile) {
      this.userProfile.username = user.username;
      // Correctly update email and role from the provided user object
      this.userProfile.email = 'email@domain.com'; // replace with actual email if needed
      this.userProfile.role = this.getUserRoleFromRoles(user.roles);
    }
  }

  private getUserRoleFromRoles(roles: { user: boolean; superAdmin: boolean; staffAdmin: boolean; controlAdmin: boolean }): string {
    if (roles.superAdmin) {
      return 'SUPER_ADMIN';
    } else if (roles.staffAdmin) {
      return 'STAFF_ADMIN';
    } else if (roles.controlAdmin) {
      return 'CONTROL_ADMIN';
    } else if (roles.user) {
      return 'USER';
    }
    return '';
  }

  // Access control endpoints
  fetchUserAccess(userId: number): Observable<Map<string, boolean>> {
    return this.http.get<{ [key: string]: boolean }>(`${this.baseUrl}/access/${userId}`, { headers: this.getAuthHeaders() }).pipe(
      map(accessMap => new Map<string, boolean>(Object.entries(accessMap))),
      tap(this.updateUserAccess.bind(this)),
      catchError(this.handleError<Map<string, boolean>>('fetchUserAccess'))
    );
  }

  // Role management endpoints
  getAllUsers(): Observable<UserRoleDto[]> {
    return this.http.get<UserRoleDto[]>(`${this.baseUrl}/roles/users`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError<UserRoleDto[]>('getAllUsers'))
    );
  }

  updateUserRole(userId: number, roleId: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/roles/users/${userId}/role`, { roleId }, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError<void>('updateUserRole'))
    );
  }

  // Helper methods
  private handleAuthResponse(response: JwtResponse): void {
    if (response.authenticated) {
      localStorage.setItem('token', response.token);
      this.loggedInUser = {
        id: 0, // Temporary until response includes ID
        username: response.username,
        roles: {
          user: response.role === 'USER',
          superAdmin: response.role === 'SUPER_ADMIN',
          staffAdmin: response.role === 'STAFF_ADMIN',
          controlAdmin: response.role === 'CONTROL_ADMIN'
        }
      };
      localStorage.setItem('user', JSON.stringify(this.loggedInUser));
      this.updateUserAccess(new Map(Object.entries(response.accessMap)));
    } else {
      this.logout();
    }
  }

  private updateUserAccess(access: Map<string, boolean>): void {
    this.userAccess = access;
    localStorage.setItem('userAccess', JSON.stringify(Array.from(access.entries())));
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
