import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

import { MonthAgenda } from '../../../../core/models/agenda.model';
import { MonthCalendarComponent } from '../../../monthly/components/month-calendar/month-calendar.component';
import { seasonForMonth } from '../../../../core/utils/season.util';
import { ThemeService } from '../../../../core/services/theme.service';

@Component({
  selector: 'app-mini-month-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MonthCalendarComponent],
  templateUrl: './mini-month-card.component.html',
  styleUrls: ['./mini-month-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiniMonthCardComponent {
  private theme = inject(ThemeService);

  @Input({ required: true }) agenda!: MonthAgenda;
  @Input() highlightToday = false;
  @Input() todayISO?: string;

  // ✅ Nuevo: para año por hoja usamos compact=false
  @Input() compact = true;

  isSeasonal() {
    return this.theme.themeId() === 'seasonal';
  }

  season() {
    return seasonForMonth(this.agenda.month);
  }
}
