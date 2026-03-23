import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly key = 'agendaNumerologica.profile.v1';

  set<T>(value: T): void {
    localStorage.setItem(this.key, JSON.stringify(value));
  }

  get<T>(): T | null {
    const raw = localStorage.getItem(this.key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  clear(): void {
    localStorage.removeItem(this.key);
  }
}
