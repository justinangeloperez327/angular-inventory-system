import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ApiHttpError } from '../../../core/http/api-http-error';
import { AlertComponent } from '../../../shared/ui/alert/alert';
import { BadgeComponent } from '../../../shared/ui/badge/badge';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { ConfirmationDialogComponent } from '../../../shared/ui/confirmation-dialog/confirmation-dialog';
import { ContentContainerComponent } from '../../../shared/ui/content-container/content-container';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton';
import { AdminUserApiService } from '../data-access/admin-user-api.service';
import { AdminUserDetail } from '../models/admin-user.model';

@Component({
  selector: 'app-admin-user-detail-page',
  imports: [
    DatePipe,
    RouterLink,
    AlertComponent,
    BadgeComponent,
    ButtonComponent,
    ConfirmationDialogComponent,
    ContentContainerComponent,
    PageHeaderComponent,
    SkeletonComponent,
  ],
  templateUrl: './admin-user-detail-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUserDetailPage implements OnInit {
  private readonly api = inject(AdminUserApiService);
  private readonly route = inject(ActivatedRoute);

  readonly userId = this.route.snapshot.paramMap.get('id') ?? '';
  readonly user = signal<AdminUserDetail | null>(null);
  readonly loading = signal(true);
  readonly updating = signal(false);
  readonly error = signal('');
  readonly confirmStatus = signal(false);

  ngOnInit(): void {
    this.load();
  }

  setActive(active: boolean): void {
    this.confirmStatus.set(false);
    this.updating.set(true);
    this.error.set('');

    this.api
      .setActive(this.userId, active)
      .pipe(finalize(() => this.updating.set(false)))
      .subscribe({
        next: (user) => this.user.set(user),
        error: (error: unknown) => this.setError(error),
      });
  }

  private load(): void {
    this.api.get(this.userId).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (user) => this.user.set(user),
      error: (error: unknown) => this.setError(error),
    });
  }

  private setError(error: unknown): void {
    this.error.set(error instanceof ApiHttpError ? error.message : 'Unable to load user.');
  }
}
