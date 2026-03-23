export type Season = 'winter' | 'spring' | 'summer' | 'autumn';

export function seasonForMonth(month1to12: number): Season {
  // Invierno: Dic-Feb | Primavera: Mar-May | Verano: Jun-Ago | Otoño: Sep-Nov
  if (month1to12 === 12 || month1to12 === 1 || month1to12 === 2) return 'winter';
  if (month1to12 >= 3 && month1to12 <= 5) return 'spring';
  if (month1to12 >= 6 && month1to12 <= 8) return 'summer';
  return 'autumn';
}
