import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  QueryList,
  ViewChildren,
  computed,
  inject,
  signal,
} from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

import { ProfileStateService } from '../../core/services/profile-state.service';
import { NumerologyService } from '../../core/services/numerology.service';
import { PdfExportService } from '../../core/services/pdf-export.service';

import { MonthAgenda } from '../../core/models/agenda.model';
import { toISODateUTC } from '../../core/utils/calendar.util';

import { MiniMonthCardComponent } from './components/mini-month-card/mini-month-card.component';

@Component({
  selector: 'app-year-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MiniMonthCardComponent],
  templateUrl: './year.page.html',
  styleUrls: ['./year.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class YearPage {
  private state = inject(ProfileStateService);
  private numerology = inject(NumerologyService);
  private pdf = inject(PdfExportService);

  // Cada <section class="page" #pdfPage> del HTML
  @ViewChildren('pdfPage') pdfPages?: QueryList<ElementRef<HTMLElement>>;

  profile = computed(() => this.state.profile()!);
  exporting = signal(false);

  todayISO = computed(() => {
    const now = new Date();
    return toISODateUTC(now.getFullYear(), now.getMonth() + 1, now.getDate());
  });

  highlightToday = computed(() => this.profile().targetYear === new Date().getFullYear());

  // 12 meses
  agendas = computed<MonthAgenda[]>(() => {
    const p = this.profile();
    return Array.from({ length: 12 }, (_, i) => this.numerology.buildMonthAgenda(p, i + 1));
  });

  // ✅ 1 mes por hoja
  pages = computed<MonthAgenda[]>(() => this.agendas());

  async exportPdf(): Promise<void> {
    const pageEls = this.pdfPages?.toArray().map(r => r.nativeElement) ?? [];
    if (!pageEls.length) return;

    this.exporting.set(true);
    try {
      const p = this.profile();
      const safeName = p.fullName.trim().replace(/\s+/g, '_');
      const fileName = `Agenda-Anual-${safeName}-${p.targetYear}-1-mes-por-hoja.pdf`;

      await this.pdf.exportElementsAsPdfPages(pageEls, {
        fileName,
        orientation: 'p', // vertical
        scale: 3,
        footer: { showPageNumbers: true },
        onBeforeCapture: async () => {
          document.body.classList.add('pdf-exporting');
          // Espera imágenes (ej. si en portada/otros componentes hay <img>)
          await waitForImages(document.body);
        },
        onAfterCapture: () => {
          document.body.classList.remove('pdf-exporting');
        },
      });
    } finally {
      this.exporting.set(false);
    }
  }
}

/**
 * Espera a que todas las <img> del DOM estén cargadas.
 * Nota: background-image (CSS) no entra aquí; si tu imagen es local en assets suele estar OK.
 */
async function waitForImages(root: HTMLElement): Promise<void> {
  const imgs = Array.from(root.querySelectorAll('img')) as HTMLImageElement[];
  if (!imgs.length) return;

  await Promise.all(
    imgs.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise<void>(resolve => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    })
  );
}
