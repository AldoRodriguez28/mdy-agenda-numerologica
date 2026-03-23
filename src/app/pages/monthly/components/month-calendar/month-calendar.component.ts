import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { MonthAgenda } from '../../../../core/models/agenda.model';

type CalendarCell =
  | { kind: 'empty' }
  | { kind: 'day'; dayOfMonth: number; dayPersonal: number; isMaster: boolean; dateISO: string; isToday: boolean };

@Component({
  selector: 'app-month-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './month-calendar.component.html',
  styleUrls: ['./month-calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonthCalendarComponent implements OnChanges {
  @Input({ required: true }) agenda!: MonthAgenda;

  @Input() compact = false;

  @Input() highlightToday = false;
  @Input() todayISO?: string; // YYYY-MM-DD

  weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  cells: CalendarCell[] = [];

  ngOnChanges(): void {
    this.buildGrid();
  }

  private buildGrid(): void {
    if (!this.agenda) {
      this.cells = [];
      return;
    }

    const days = this.agenda.days;
    const startOffset = days[0]?.weekdayMon0 ?? 0;

    const cells: CalendarCell[] = [];
    for (let i = 0; i < startOffset; i++) cells.push({ kind: 'empty' });

    for (const d of days) {
      const isToday = this.highlightToday && !!this.todayISO && d.dateISO === this.todayISO;

      cells.push({
        kind: 'day',
        dayOfMonth: d.dayOfMonth,
        dayPersonal: d.dayPersonal,
        isMaster: d.isMaster,
        dateISO: d.dateISO,
        isToday,
      });
    }

    while (cells.length % 7 !== 0) cells.push({ kind: 'empty' });
    this.cells = cells;
  }
}
