import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserProfile } from './auth.service';// Import your UserProfile interface

@Injectable({
  providedIn: 'root'
})
export class AccessService {

  private accessUrl = 'http://localhost:8081/api/v1/access'; // Ensure this matches your backend URL

  constructor(private http: HttpClient) { }

  // Method to get user access
  getUserAccess(userId: number): Observable<Map<string, boolean>> {
    return this.http.get<Map<string, boolean>>(`${this.accessUrl}/access/${userId}`);
  }

  // Method to get user profile
  getUserProfile(username: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.accessUrl}/profile/${username}`);
  }
}
