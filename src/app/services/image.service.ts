import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private apiUrl = 'http://localhost:8081/api/v1/images'; // Update URL sesuai dengan endpoint backend Anda

  constructor(private http: HttpClient) {}

  getImages(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/images`);
  }
  
  getLogoUrl(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/logo`);
  }
}
