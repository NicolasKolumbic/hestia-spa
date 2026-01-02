import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface LoginResponse {
  access_token?: string;
  requires2fa?: boolean;
  temp_token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Using localhost:3000 based on standard NestJS setup. 
  // Ideally this should be in an environment file.
  private apiUrl = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) { }

  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl + '/login', credentials);
  }

  verify2fa(token: string, code: string): Observable<{ access_token: string }> {
    return this.http.post<{ access_token: string }>(this.apiUrl + '/2fa/authenticate', { token, code });
  }
}
