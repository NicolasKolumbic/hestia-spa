import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Environment {

  get apiUrl(): string {
    return this.isProduction ? 'https://hestia-web-api.onrender.com/api' : 'http://localhost:3000/api';
  }

  get gatewayUrl(): string {
    return environment.gatewayUrl || (this.isProduction ? '' : 'http://localhost:8081');
  }

  get isProduction(): boolean {
    return environment.production;
  }
}
