export function sumDigits(n: number): number {
  const digits = Math.abs(n).toString().split('').map(d => Number(d));
  return digits.reduce((acc, cur) => acc + cur, 0);
}

export function isMasterNumber(n: number): boolean {
  return n === 11 || n === 22;
}

/**
 * Reduce a un dígito, excepto si queda 11 o 22 (se detiene ahí).
 * Devuelve pasos tipo "2+2+0+6+2+0+2+5=19".
 */
export function reduceWithSteps(input: number): { steps: string[]; reduced: number; isMaster: boolean } {
  const steps: string[] = [];
  let current = Math.abs(input);

  const toSumExpression = (value: number) => {
    const digits = value.toString().split('');
    const sum = digits.reduce((a, b) => a + Number(b), 0);
    return `${digits.join('+')}=${sum}`;
  };

  // Si ya es dígito o master, no reducir
  if (current < 10 || isMasterNumber(current)) {
    return { steps, reduced: current, isMaster: isMasterNumber(current) };
  }

  while (current >= 10 && !isMasterNumber(current)) {
    const expr = toSumExpression(current);
    const next = sumDigits(current);
    steps.push(expr);
    current = next;

    if (isMasterNumber(current)) break;
  }

  return { steps, reduced: current, isMaster: isMasterNumber(current) };
}

/** Parse ISO "YYYY-MM-DD" sin depender de timezone */
export function parseISODate(iso: string): { day: number; month: number; year: number } {
  const [y, m, d] = iso.split('-').map(Number);
  return { day: d, month: m, year: y };
}

/**
 * Suma dígitos de día+mes+año con padding:
 * 22/6/2025 => "22062025" => 2+2+0+6+2+0+2+5
 */
export function sumDigitsOfDMY(day: number, month: number, year: number): { sum: number; expression: string } {
  const dd = String(day).padStart(2, '0');
  const mm = String(month).padStart(2, '0');
  const yyyy = String(year);

  const digitsStr = `${dd}${mm}${yyyy}`;
  const parts = digitsStr.split('').map(Number);
  const sum = parts.reduce((a, b) => a + b, 0);
  const expression = `${parts.join('+')}=${sum}`;
  return { sum, expression };
}

/** Reduce un día calendario, respetando 11/22 */
export function reduceCalendarDay(day: number): { steps: string[]; reduced: number; isMaster: boolean } {
  if (day === 11 || day === 22) return { steps: [], reduced: day, isMaster: true };
  return reduceWithSteps(day);
}
