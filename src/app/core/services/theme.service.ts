import { Injectable, effect, inject, signal } from '@angular/core';
import { ProfileStateService } from './profile-state.service';

type ThemeId = 'minimal' | 'mystic' | 'corporate' | 'seasonal' | 'tree';

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
    '--font-title': '"Playfair Display", serif',
    '--font-body': '"Source Sans 3", sans-serif',
    '--font-accent': '"Playfair Display", serif',
    '--page-bg': '#ffffff',
    '--page-border': 'rgba(0,0,0,0.06)',
    '--page-radius': '18px',
    '--cell-radius': '14px',
    '--cell-bg': 'rgba(255,255,255,0.9)',
    '--cell-border': 'rgba(0,0,0,0.06)',
    '--art-url': 'none',
    '--art-opacity': '0',
    '--page-art-url': 'none',
  },
  mystic: {
    '--paper': '#fbf9ff',
    '--ink': '#1d1b24',
    '--muted': 'rgba(29,27,36,.72)',
    '--surface': 'rgba(42,28,86,.06)',
    '--border': 'rgba(42,28,86,.14)',
    '--accent': '#8d6bff',
    '--accent-soft': 'rgba(141,107,255,.18)',
    '--toolbar-bg': '#fbf9ff',
    '--toolbar-fg': '#1d1b24',
    '--font-title': '"Cinzel", serif',
    '--font-body': '"DM Sans", sans-serif',
    '--font-accent': '"Marcellus", serif',
    '--page-bg': '#fbf9ff',
    '--page-border': 'rgba(42,28,86,0.14)',
    '--page-radius': '20px',
    '--cell-radius': '16px',
    '--cell-bg': 'rgba(255,255,255,0.9)',
    '--cell-border': 'rgba(42,28,86,0.10)',
    '--art-url': "url('/assets/themes/mystic.svg')",
    '--art-opacity': '0.14',
    '--page-art-url': "url('/assets/themes/mystic.svg')",
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
    '--font-title': '"Space Grotesk", sans-serif',
    '--font-body': '"Space Grotesk", sans-serif',
    '--font-accent': '"Space Grotesk", sans-serif',
    '--page-bg': '#f7f9fc',
    '--page-border': 'rgba(2,6,23,0.12)',
    '--page-radius': '14px',
    '--cell-radius': '10px',
    '--cell-bg': '#ffffff',
    '--cell-border': 'rgba(2,6,23,0.08)',
    '--art-url': "url('/assets/themes/corporate.svg')",
    '--art-opacity': '0.10',
    '--page-art-url': "url('/assets/themes/corporate.svg')",
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
    '--art-url': "url('/assets/themes/tree.jpg')",
    '--art-opacity': '0.18',
    '--page-art-url': "url('/assets/themes/tree.jpg')",
    '--font-title': '"Playfair Display", serif',
    '--font-body': '"Source Sans 3", sans-serif',
    '--font-accent': '"Playfair Display", serif',
    '--page-bg': '#f9fbff',
    '--page-border': 'rgba(57,105,162,0.18)',
    '--page-radius': '18px',
    '--cell-radius': '14px',
    '--cell-bg': 'rgba(255,255,255,0.92)',
    '--cell-border': 'rgba(57,105,162,0.12)',
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
