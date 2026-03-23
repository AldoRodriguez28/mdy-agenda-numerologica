import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { ProfileStateService } from '../../core/services/profile-state.service';
import { UserProfile } from '../../core/models/profile.model';
import { MatSelectModule } from '@angular/material/select'; // 👈 ADD

@Component({
  selector: 'app-setup-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule
  ],
  templateUrl: './setup.page.html',
  styleUrls: ['./setup.page.scss'],
})
export class SetupPage {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private state = inject(ProfileStateService);

  photoDataUrl?: string;

   themes = [
    { value: 'minimal', label: 'Minimal premium' },
    { value: 'mystic', label: 'Místico sutil' },
    { value: 'corporate', label: 'Moderno corporativo' },
    { value: 'seasonal', label: 'Temporadas (acento por estación)' },
    { value: 'tree', label: 'Árbol artístico (fondo premium)' },
  ] as const;

  form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    birthDate: [null as Date | null, [Validators.required]],
    targetYear: [new Date().getFullYear(), [Validators.required, Validators.min(1900), Validators.max(3000)]],
    themeId: ['minimal' as UserProfile['themeId'], [Validators.required]],

  });

  async onFile(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.photoDataUrl = await this.readFileAsDataUrl(file);
  }

   submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { fullName, birthDate, targetYear, themeId } = this.form.getRawValue();

    const profile: UserProfile = {
      fullName: fullName.trim(),
      birthDateISO: this.dateToISO(birthDate!),
      targetYear,
      photoDataUrl: this.photoDataUrl,
      themeId,
    };

    this.state.setProfile(profile);
    this.router.navigateByUrl('/cover');
  }

  private dateToISO(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
