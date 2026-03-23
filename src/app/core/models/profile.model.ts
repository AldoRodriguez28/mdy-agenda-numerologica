export interface UserProfile {
  fullName: string;
  birthDateISO: string;   // "YYYY-MM-DD"
  targetYear: number;     // año a calcular
  photoDataUrl?: string;  // base64 preview
  themeId?: 'minimal' | 'mystic' | 'corporate' | 'seasonal'| 'tree';

}

export interface DigitReduction {
  input: number;
  steps: string[];  // Ej: "2+2+0+6+2+0+2+5=19", "1+9=10", "1+0=1"
  reduced: number;  // Resultado final (respetando 11/22)
  isMaster: boolean;
}

export interface CalculationItem {
  key: string;
  title: string;
  description?: string;
  rawValue: number | string;
  reduction?: DigitReduction;
}
