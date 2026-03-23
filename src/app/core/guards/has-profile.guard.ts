import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ProfileStateService } from '../services/profile-state.service';

export const hasProfileGuard: CanActivateFn = () => {
  const state = inject(ProfileStateService);
  const router = inject(Router);

  if (state.hasProfile()) return true;
  return router.parseUrl('/setup');
};
