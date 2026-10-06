import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ApiHttpError } from '../../../core/http/api-http-error';
import { AlertComponent } from '../../../shared/ui/alert/alert';
import { BadgeComponent } from '../../../shared/ui/badge/badge';
import { ContentContainerComponent } from '../../../shared/ui/content-container/content-container';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton';
import { TableComponent } from '../../../shared/ui/table/table';
import { AdminRoleApiService } from '../data-access/admin-role-api.service';
import { AdminRoleSummary } from '../models/admin-role.model';

@Component({
  selector: 'app-admin-role-list-page',
  imports: [
    DatePipe,
    RouterLink,
    AlertComponent,
    BadgeComponent,
    ContentContainerComponent,
    EmptyStateComponent,
    PageHeaderComponent,
    SkeletonComponent,
    TableComponent,
  ],
  templateUrl: './admin-role-list-page.html',
  styleUrl: './admin-role-list-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminRoleListPage implements OnInit {
  private readonly api = inject(AdminRoleApiService);

  readonly items = signal<readonly AdminRoleSummary[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  ngOnInit(): void {
    this.api.list().pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (items) => this.items.set(items),
      error: (error: unknown) =>
        this.error.set(error instanceof ApiHttpError ? error.message : 'Unable to load roles.'),
    });
  }
}
