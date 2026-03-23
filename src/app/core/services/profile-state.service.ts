import { Injectable, computed, signal } from '@angular/core';
import { UserProfile } from '../models/profile.model';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class ProfileStateService {
  private readonly _profile = signal<UserProfile | null>(null);

  readonly profile = this._profile.asReadonly();
  readonly hasProfile = computed(() => !!this._profile());

  constructor(private storage: StorageService) {
    const saved = this.storage.get<UserProfile>();
    if (saved) this._profile.set(saved);
  }

  setProfile(profile: UserProfile): void {
    this._profile.set(profile);
    this.storage.set(profile);
  }

  clear(): void {
    this._profile.set(null);
    this.storage.clear();
  }
}
