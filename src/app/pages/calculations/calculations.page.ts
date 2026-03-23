import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

import { ProfileStateService } from '../../core/services/profile-state.service';
import { NumerologyService } from '../../core/services/numerology.service';
import { CalculationItem } from '../../core/models/profile.model';

@Component({
  selector: 'app-calculations-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
  ],
  templateUrl: './calculations.page.html',
  styleUrls: ['./calculations.page.scss'],
})
export class CalculationsPage {
  private state = inject(ProfileStateService);
  private numerology = inject(NumerologyService);

  private profile = computed(() => this.state.profile()!);

  month = signal<number>(12);
  day = signal<number>(1);

  months = [
    { value: 1, label: 'Enero (1)' }, { value: 2, label: 'Febrero (2)' }, { value: 3, label: 'Marzo (3)' },
    { value: 4, label: 'Abril (4)' }, { value: 5, label: 'Mayo (5)' }, { value: 6, label: 'Junio (6)' },
    { value: 7, label: 'Julio (7)' }, { value: 8, label: 'Agosto (8)' }, { value: 9, label: 'Septiembre (9)' },
    { value: 10, label: 'Octubre (10)' }, { value: 11, label: 'Noviembre (11)' }, { value: 12, label: 'Diciembre (12)' },
  ];

  coreItems = computed<CalculationItem[]>(() => this.numerology.buildCoreCalculations(this.profile()));
  yearPersonal = computed<CalculationItem>(() => this.numerology.buildYearPersonal(this.profile()));

  monthPersonal = computed<CalculationItem>(() => {
    const yp = this.yearPersonal().reduction?.reduced ?? 0;
    return this.numerology.buildMonthPersonal(yp, this.month());
  });

  dayPersonal = computed<CalculationItem>(() => {
    const mp = this.monthPersonal().reduction?.reduced ?? 0;
    const day = this.clampDay(this.day());
    return this.numerology.buildDayPersonal(mp, day);
  });

  toInt(v: string): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : 1;
  }

  private clampDay(n: number): number {
    const x = Math.floor(Number(n));
    if (!Number.isFinite(x)) return 1;
    if (x < 1) return 1;
    if (x > 31) return 31;
    return x;
  }
}
