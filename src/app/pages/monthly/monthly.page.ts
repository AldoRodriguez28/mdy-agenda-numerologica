import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import { ProfileStateService } from '../../core/services/profile-state.service';
import { NumerologyService } from '../../core/services/numerology.service';
import { MonthAgenda } from '../../core/models/agenda.model';
import { MONTHS_ES, toISODateUTC } from '../../core/utils/calendar.util';
import { MonthCalendarComponent } from './components/month-calendar/month-calendar.component';
import { PdfExportService } from '../../core/services/pdf-export.service';
import { ThemeService } from '../../core/services/theme.service';
import { seasonForMonth } from '../../core/utils/season.util';

@Component({
  selector: 'app-monthly-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MonthCalendarComponent],
  templateUrl: './monthly.page.html',
  styleUrls: ['./monthly.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonthlyPage {
  private state = inject(ProfileStateService);
  private numerology = inject(NumerologyService);
  private pdf = inject(PdfExportService);
  private theme = inject(ThemeService);

  // Se renderiza SOLO mientras se exporta (offscreen)
  @ViewChild('pdfPage', { static: false }) pdfPage?: ElementRef<HTMLElement>;

  profile = computed(() => this.state.profile()!);

  selectedMonth = signal<number>(new Date().getMonth() + 1);
  exporting = signal(false);

  months = MONTHS_ES.map((label, idx) => ({
    value: idx + 1,
    label: `${label} (${idx + 1})`,
  }));

  todayISO = computed(() => {
    const now = new Date();
    return toISODateUTC(now.getFullYear(), now.getMonth() + 1, now.getDate());
  });

  highlightToday = computed(() => this.profile().targetYear === new Date().getFullYear());

  agenda = computed<MonthAgenda>(() => {
    return this.numerology.buildMonthAgenda(this.profile(), this.selectedMonth());
  });

  isSeasonal = computed(() => this.theme.themeId() === 'seasonal');
  season = computed(() => seasonForMonth(this.selectedMonth()));

  async exportPdf(): Promise<void> {
    this.exporting.set(true);

    try {
      // Espera a que Angular pinte el DOM offscreen
      await nextFrame();
      await nextFrame();

      const el = await this.waitForPdfElement();
      if (!el) return;

      const p = this.profile();
      const monthLabel = this.agenda().monthLabel;
      const safeName = p.fullName.trim().replace(/\s+/g, '_');
      const fileName = `Agenda-Mensual-${safeName}-${p.targetYear}-${monthLabel}.pdf`;

      await this.pdf.exportElementsAsPdfPages([el], {
        fileName,
        // Landscape para tener más área útil
        orientation: 'l',
        // 1 página: podemos ir un poco más alto
        scale: 2.5,
        imageType: 'jpeg',
        jpegQuality: 0.92,
        waitForFonts: true,
        waitForImages: true,
        footer: { showPageNumbers: true, leftText: 'Agenda numerológica · Uso personal' },
        onBeforeCapture: () => document.body.classList.add('pdf-exporting'),
        onAfterCapture: () => document.body.classList.remove('pdf-exporting'),
      });
    } finally {
      this.exporting.set(false);
    }
  }

  private async waitForPdfElement(timeoutMs = 1200): Promise<HTMLElement | null> {
    const start = performance.now();
    while (performance.now() - start < timeoutMs) {
      const el = this.pdfPage?.nativeElement;
      if (el) return el;
      await nextFrame();
    }
    return null;
  }
}

function nextFrame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()));
}
