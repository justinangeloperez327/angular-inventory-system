import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { PERMISSIONS } from '../../../core/auth/permissions';
import { ApiHttpError } from '../../../core/http/api-http-error';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { AlertComponent } from '../../../shared/ui/alert/alert';
import { BadgeComponent } from '../../../shared/ui/badge/badge';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { ConfirmationDialogComponent } from '../../../shared/ui/confirmation-dialog/confirmation-dialog';
import { ContentContainerComponent } from '../../../shared/ui/content-container/content-container';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton';
import { CustomerApiService } from '../data-access/customer-api.service';
import { CustomerDetail } from '../models/customer.model';

@Component({
  selector: 'app-customer-detail-page',
  imports: [
    DatePipe,
    RouterLink,
    HasPermissionDirective,
    AlertComponent,
    BadgeComponent,
    ButtonComponent,
    ConfirmationDialogComponent,
    ContentContainerComponent,
    PageHeaderComponent,
    SkeletonComponent,
  ],
  templateUrl: './customer-detail-page.html',
  styleUrl: './customer-detail-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerDetailPage implements OnInit {
  private readonly api = inject(CustomerApiService);
  private readonly route = inject(ActivatedRoute);

  readonly permissions = PERMISSIONS;
  readonly item = signal<CustomerDetail | null>(null);
  readonly loading = signal(true);
  readonly updating = signal(false);
  readonly error = signal('');
  readonly confirmDeactivate = signal(false);
  readonly customerId = this.route.snapshot.paramMap.get('id') ?? '';

  ngOnInit(): void {
    this.load();
  }

  setActive(active: boolean): void {
    this.confirmDeactivate.set(false);
    this.updating.set(true);
    this.error.set('');

    this.api
      .setActive(this.customerId, active)
      .pipe(finalize(() => this.updating.set(false)))
      .subscribe({
        next: (item) => this.item.set(item),
        error: (error: unknown) =>
          this.error.set(error instanceof ApiHttpError ? error.message : 'Unable to update customer.'),
      });
  }

  private load(): void {
    this.api.get(this.customerId).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (item) => this.item.set(item),
      error: (error: unknown) =>
        this.error.set(error instanceof ApiHttpError ? error.message : 'Unable to load customer.'),
    });
  }
}
