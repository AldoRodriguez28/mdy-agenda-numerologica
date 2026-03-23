import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

import { ProfileStateService } from '../../core/services/profile-state.service';

@Component({
  selector: 'app-cover-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, RouterLink],
  templateUrl: './cover.page.html',
  styleUrls: ['./cover.page.scss'],
})
export class CoverPage {
  private state = inject(ProfileStateService);
  private profile = computed(() => this.state.profile());

  name = computed(() => this.profile()?.fullName ?? '');
  year = computed(() => this.profile()?.targetYear ?? '');
  photo = computed(() => this.profile()?.photoDataUrl);
}
