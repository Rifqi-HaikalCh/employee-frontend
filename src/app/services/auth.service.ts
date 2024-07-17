import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8081';
  private loggedInUser: User | null = null;

  constructor(private http: HttpClient) { }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

    logout(): void {
    this.loggedInUser = null;
    localStorage.removeItem('token');
  }

  getUsername(): string {
    return this.loggedInUser ? this.loggedInUser.username : '';
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/authenticate`, { username, password }).pipe(
      tap(response => {
        localStorage.setItem('token', response.token); // Simpan token di localStorage
      })
    );
  }

  register(user: { username: string, email: string, password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, user);
  }

  getUserProfile(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/v1/users/profile`).pipe(
      tap(user => this.loggedInUser = user)
    );
  }

  updateUserProfile(user: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/api/v1/users/profile`, user).pipe(
      tap(updatedUser => this.loggedInUser = updatedUser)
    );
  }

  deleteAccount(): Observable<any> {
    if (!this.loggedInUser) {
      throw new Error('User is not logged in'); // Atau lakukan penanganan sesuai kebutuhan
    }
    
    const userId = this.loggedInUser.id; // Mengambil ID user yang sedang login
    const url = `${this.baseUrl}/users/${userId}`; // Sesuaikan dengan endpoint backend Anda
    return this.http.delete(url).pipe(
      tap(() => {
        this.logout(); // Logout pengguna setelah berhasil menghapus akun
      })
    );
  
  }

  getEmail(): string {
    return this.loggedInUser ? this.loggedInUser.email : '';
  }

  getRole(): string {
    return this.loggedInUser ? this.loggedInUser.role : '';
  }

  getUserId(): string {
    return this.loggedInUser ? this.loggedInUser.id : '';
  }
}
