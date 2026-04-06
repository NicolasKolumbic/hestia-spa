import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { from, Observable, Subject, switchMap, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Environment } from './environment';
import { LoggedResponseDto } from '@core/domain/dtos/logged-user-response.dto';
import { User } from '@core/domain/models/user';
import { SessionStorageService } from './session-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  readonly #http = inject(HttpClient);
  readonly #environment = inject(Environment);
  readonly #session = inject(SessionStorageService);

  #user$ = new Subject<User>();
  #user!: User;

  get user$(): Observable<User> {
    return this.#user$.asObservable();
  }

  get user(): User {
    return this.#user;
  }

  constructor() {
    if (this.#session.has('user')) {
      this.#user = new User(this.#session.get('user')!);
    }
  }

  login(credentials: { email: string; password: string }): Observable<LoggedResponseDto> {
    return this.#http.post<LoggedResponseDto>(`${this.#environment.apiUrl}/auth/login`, credentials);
  }

  verify2fa(token: string, code: string): Observable<any> {
    return this.#http.post(`${this.#environment.apiUrl}/2fa/authenticate`, { token, code });
  }

  register(data: any): Observable<any> {
    return this.#http.post(`${this.#environment.apiUrl}/auth/register`, data);
  }

  logout(): Observable<any> {
    return this.#http.post(`${this.#environment.apiUrl}/auth/logout`, {}).pipe(tap(() => {
      this.#session.remove('user');
    }));
  }

  generate2faSecret(): Observable<{ secret: string; otpauthUrl: string; qrCode: string }> {
    return this.#http.post<{ secret: string; otpauthUrl: string; qrCode: string }>(`${this.#environment.apiUrl}/2fa/generate`, {});
  }

  turnOn2fa(code: string): Observable<any> {
    return this.#http.post(`${this.#environment.apiUrl}/2fa/turn-on`, { twoFactorAuthenticationCode: code });
  }

  getProfile(): Observable<any> {
    return this.#http.get(`${this.#environment.apiUrl}/auth/me`, { withCredentials: true });
  }

  setUser(user: LoggedResponseDto): void {
    this.#session.set('user', user);
    this.#user = new User(user);
    this.#user$.next(this.#user);
  }
}
