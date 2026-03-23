import { Injectable, effect, inject, signal } from '@angular/core';
import { ProfileStateService } from './profile-state.service';

type ThemeId = 'minimal' | 'mystic' | 'corporate' | 'seasonal'| 'tree';

type ThemeVars = Record<string, string>;

const THEMES: Record<Exclude<ThemeId, 'seasonal'>, ThemeVars> = {
  minimal: {
    '--paper': '#ffffff',
    '--ink': '#141414',
    '--muted': 'rgba(20,20,20,.72)',
    '--surface': 'rgba(20,20,20,.02)',
    '--border': 'rgba(20,20,20,.08)',
    '--accent': '#141414',
    '--accent-soft': 'rgba(20,20,20,.12)',
    '--toolbar-bg': '#ffffff',
    '--toolbar-fg': '#141414',
  },
  mystic: {
    '--paper': '#ffffff',
    '--ink': '#12121a',
    '--muted': 'rgba(18,18,26,.72)',
    '--surface': 'rgba(80,60,140,.06)',
    '--border': 'rgba(80,60,140,.14)',
    '--accent': '#4f3aa8',
    '--accent-soft': 'rgba(79,58,168,.18)',
    '--toolbar-bg': '#ffffff',
    '--toolbar-fg': '#12121a',
  },
  corporate: {
    '--paper': '#ffffff',
    '--ink': '#0f172a',
    '--muted': 'rgba(15,23,42,.70)',
    '--surface': 'rgba(2,6,23,.02)',
    '--border': 'rgba(2,6,23,.10)',
    '--accent': '#0b3a87',
    '--accent-soft': 'rgba(11,58,135,.18)',
    '--toolbar-bg': '#ffffff',
    '--toolbar-fg': '#0f172a',
  },
   // ✅ Nuevo tema con tu imagen
  tree: {
    '--paper': '#ffffff',
    '--ink': '#141414',
    '--muted': 'rgba(20,20,20,.72)',
    '--surface': 'rgba(20,20,20,.02)',
    '--border': 'rgba(20,20,20,.10)',
    '--accent': '#3969a2',        // azul de la imagen
    '--accent-soft': 'rgba(57,105,162,.20)',
    '--toolbar-bg': '#ffffff',
    '--toolbar-fg': '#141414',
    '--art-url': "url('assets/themes/tree.jpg')",
    '--art-opacity': '0.18',
  },
};

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private state = inject(ProfileStateService);

  // Solo para consulta desde componentes
  themeId = signal<ThemeId>('minimal');

  constructor() {
    effect(() => {
      const profile = this.state.profile();
      const id = (profile?.themeId ?? 'minimal') as ThemeId;

      this.themeId.set(id);

      // “seasonal” usa base minimal y la estacionalidad se aplica por mes (en cards)
      const base: ThemeVars = id === 'seasonal' ? THEMES.minimal : THEMES[id];

      this.applyVars(base);
      this.setThemeAttr(id);
    });
  }

  private applyVars(vars: ThemeVars) {
    const root = document.documentElement;
    for (const [k, v] of Object.entries(vars)) {
      root.style.setProperty(k, v);
    }
  }

  private setThemeAttr(id: ThemeId) {
    document.documentElement.setAttribute('data-theme', id);
  }
}
