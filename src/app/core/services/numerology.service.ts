import { Injectable } from '@angular/core';
import { CalculationItem, DigitReduction, UserProfile } from '../models/profile.model';
import { MonthAgenda, DayAgendaItem } from '../models/agenda.model';
import { parseISODate, reduceCalendarDay, reduceWithSteps, sumDigitsOfDMY } from '../utils/numerology.util';
import { MONTHS_ES, daysInMonth, toISODateUTC, weekdayMon0 } from '../utils/calendar.util';

@Injectable({ providedIn: 'root' })
export class NumerologyService {

  buildCoreCalculations(profile: UserProfile): CalculationItem[] {
    const { day, month, year } = parseISODate(profile.birthDateISO);

    const almaReduction = this.toReduction(day);
    const karmaReduction = this.toReduction(month);

    const lastTwo = year % 100;
    const regaloReduction = this.toReduction(lastTwo);

    const pasadaReduction = this.toReduction(year);

    const mvSum = sumDigitsOfDMY(day, month, year);
    const mvReduction = this.toReduction(mvSum.sum, [mvSum.expression]);

    return [
      { key: 'alma', title: 'ALMA', description: 'Día de nacimiento.', rawValue: day, reduction: almaReduction },
      { key: 'karma', title: 'KARMA', description: 'Mes de nacimiento.', rawValue: month, reduction: karmaReduction },
      { key: 'regalo', title: 'REGALO DE DIOS', description: 'Últimos dos números del año de nacimiento.', rawValue: lastTwo, reduction: regaloReduction },
      { key: 'mision_pasada', title: 'MISIÓN DE VIDA PASADA', description: 'Año de nacimiento.', rawValue: year, reduction: pasadaReduction },
      { key: 'mision_vida', title: 'MISIÓN DE VIDA', description: 'Suma de día, mes y año de nacimiento.', rawValue: mvSum.sum, reduction: mvReduction },
    ];
  }

  /**
   * AÑO PERSONAL (según tu ejemplo):
   * (día + mes de nacimiento + año a calcular) en dígitos
   */
  buildYearPersonal(profile: UserProfile): CalculationItem {
    const { day, month } = parseISODate(profile.birthDateISO);
    const { sum, expression } = sumDigitsOfDMY(day, month, profile.targetYear);
    const reduction = this.toReduction(sum, [expression]);

    return {
      key: 'anio_personal',
      title: 'AÑO PERSONAL',
      description: `Día y mes de nacimiento + año (${profile.targetYear}).`,
      rawValue: sum,
      reduction,
    };
  }

  /** MES PERSONAL = (año personal reducido) + mes (1..12) */
  buildMonthPersonal(yearPersonalReduced: number, monthNumber: number): CalculationItem {
    const base = yearPersonalReduced + monthNumber;
    const expression = `${yearPersonalReduced}+${monthNumber}=${base}`;
    const reduction = this.toReduction(base, [expression]);

    return {
      key: 'mes_personal',
      title: 'MES PERSONAL',
      description: '(Año personal) + (mes en cuestión).',
      rawValue: base,
      reduction,
    };
  }

  /**
   * DÍA PERSONAL = (mes personal reducido) + (día calendario reducido; se respetan 11/22)
   */
  buildDayPersonal(monthPersonalReduced: number, calendarDay: number): CalculationItem {
    const dayReducedObj = reduceCalendarDay(calendarDay);
    const dayReduced = dayReducedObj.reduced;

    const base = monthPersonalReduced + dayReduced;
    const expression = `${monthPersonalReduced}+${dayReduced}=${base}`;

    const extraSteps = [
      expression,
      ...(dayReducedObj.steps.length ? dayReducedObj.steps.map(s => `Día: ${s}`) : []),
      ...(dayReducedObj.isMaster ? [`Día: se respetó número maestro (${dayReduced})`] : []),
    ];

    const reduction = this.toReduction(base, extraSteps);

    return {
      key: 'dia_personal',
      title: 'DÍA PERSONAL',
      description: '(Mes personal) + (día calendario reducido; se respetan 11/22).',
      rawValue: base,
      reduction,
    };
  }

  /**
   * Construye la agenda mensual (mes personal + día personal para cada día del mes)
   */
  buildMonthAgenda(profile: UserProfile, monthNumber: number): MonthAgenda {
    const yearPersonal = this.buildYearPersonal(profile).reduction?.reduced ?? 0;
    const monthPersonalItem = this.buildMonthPersonal(yearPersonal, monthNumber);
    const monthPersonalReduced = monthPersonalItem.reduction?.reduced ?? 0;
    const monthPersonalIsMaster = !!monthPersonalItem.reduction?.isMaster;

    const totalDays = daysInMonth(profile.targetYear, monthNumber);

    const days: DayAgendaItem[] = [];
    for (let d = 1; d <= totalDays; d++) {
      const dayCalc = this.buildDayPersonal(monthPersonalReduced, d);
      const reduced = dayCalc.reduction?.reduced ?? 0;
      const isMaster = !!dayCalc.reduction?.isMaster;

      days.push({
        dateISO: toISODateUTC(profile.targetYear, monthNumber, d),
        dayOfMonth: d,
        weekdayMon0: weekdayMon0(profile.targetYear, monthNumber, d),
        dayPersonal: reduced,
        isMaster,
      });
    }

    return {
      year: profile.targetYear,
      month: monthNumber,
      monthLabel: MONTHS_ES[monthNumber - 1],
      monthPersonal: monthPersonalReduced,
      monthPersonalIsMaster,
      days,
    };
  }

  private toReduction(input: number, prependSteps: string[] = []): DigitReduction {
    const reduced = reduceWithSteps(input);
    return {
      input,
      steps: [...prependSteps, ...reduced.steps],
      reduced: reduced.reduced,
      isMaster: reduced.isMaster,
    };
  }
}
