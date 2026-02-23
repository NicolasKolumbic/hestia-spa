import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { from, Observable, switchMap, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Environment } from './environment';

export interface LoginResponse {
  access_token?: string;
  requires2fa?: boolean;
  temp_token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  #http = inject(HttpClient);
  #environment = inject(Environment);
  #router = inject(Router);

  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.#http.post<LoginResponse>(`${this.#environment.apiUrl}/auth/login`, credentials);
  }

  verify2fa(token: string, code: string): Observable<any> {
    return this.#http.post(`${this.#environment.apiUrl}/2fa/authenticate`, { token, code });
  }

  register(data: any): Observable<any> {
    return this.#http.post(`${this.#environment.apiUrl}/auth/register`, data);
  }

  logout(): Observable<any> {
    return this.#http.post(`${this.#environment.apiUrl}/auth/logout`, {});
  }

  generate2faSecret(): Observable<{ secret: string; otpauthUrl: string; qrCode: string }> {
    return this.#http.post<{ secret: string; otpauthUrl: string; qrCode: string }>(`${this.#environment.apiUrl}/2fa/generate`, {});
  }

  turnOn2fa(code: string): Observable<any> {
    return this.#http.post(`${this.#environment.apiUrl}/2fa/turn-on`, { twoFactorAuthenticationCode: code });
  }

  getProfile(): Observable<any> {
    return this.#http.get(`${this.#environment.apiUrl}/auth/me`);
  }
}
