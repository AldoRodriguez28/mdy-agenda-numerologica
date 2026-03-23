export interface DayAgendaItem {
  dateISO: string;     // YYYY-MM-DD
  dayOfMonth: number;  // 1..31
  weekdayMon0: number; // 0=Lun ... 6=Dom
  dayPersonal: number; // resultado reducido
  isMaster: boolean;   // si el resultado final fue 11/22
}

export interface MonthAgenda {
  year: number;
  month: number;       // 1..12
  monthLabel: string;
  monthPersonal: number;
  monthPersonalIsMaster: boolean;
  days: DayAgendaItem[];
}
