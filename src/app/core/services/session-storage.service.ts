import { inject, Injectable } from '@angular/core';
import { WindowService } from './window-service';

@Injectable({
  providedIn: 'root',
})
export class SessionStorageService {
  #sessionStorage: Storage;
  #window = inject(WindowService);

  constructor() {
    this.#sessionStorage = this.#window.nativeWindow.sessionStorage;
  }

  set<T>(key: string, value: T): void {
    this.#sessionStorage.setItem(key, JSON.stringify(value));
  }

  get<T>(key: string): T | null {
    const item = this.#sessionStorage.getItem(key);

    if (item === null) {
      return null;
    }

    return JSON.parse(item) satisfies T;
  }

  has(key: string): boolean {
    return this.#sessionStorage.getItem(key) !== null;
  }

  remove(key: string): void {
    this.#sessionStorage.removeItem(key);
  }
}
