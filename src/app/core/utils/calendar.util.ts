export function daysInMonth(year: number, month1to12: number): number {
  // UTC para evitar DST/zonas
  return new Date(Date.UTC(year, month1to12, 0)).getUTCDate();
}

export function weekdayMon0(year: number, month1to12: number, day: number): number {
  // getUTCDay(): 0=Dom..6=Sáb -> lo convertimos a 0=Lun..6=Dom
  const dowSun0 = new Date(Date.UTC(year, month1to12 - 1, day)).getUTCDay();
  return (dowSun0 + 6) % 7;
}

export function toISODateUTC(year: number, month1to12: number, day: number): string {
  const mm = String(month1to12).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

export const MONTHS_ES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
] as const;
