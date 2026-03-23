import { Routes } from '@angular/router';
import { hasProfileGuard } from './core/guards/has-profile.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'setup' },
  {
    path: 'setup',
    loadComponent: () => import('./pages/setup/setup.page').then(m => m.SetupPage),
  },
  {
    path: 'cover',
    canActivate: [hasProfileGuard],
    loadComponent: () => import('./pages/cover/cover.page').then(m => m.CoverPage),
  },
  {
    path: 'calculations',
    canActivate: [hasProfileGuard],
    loadComponent: () => import('./pages/calculations/calculations.page').then(m => m.CalculationsPage),
  },
  {
  path: 'monthly',
  canActivate: [hasProfileGuard],
  loadComponent: () => import('./pages/monthly/monthly.page').then(m => m.MonthlyPage),
  },
  {
  path: 'year',
  canActivate: [hasProfileGuard],
  loadComponent: () => import('./pages/year/year.page').then(m => m.YearPage),
  },
  { path: '**', redirectTo: 'setup' },
];
