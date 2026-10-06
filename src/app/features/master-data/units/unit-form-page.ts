import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ApiHttpError } from '../../../core/http/api-http-error';
import { AlertComponent } from '../../../shared/ui/alert/alert';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { ContentContainerComponent } from '../../../shared/ui/content-container/content-container';
import { InputComponent } from '../../../shared/ui/input/input';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton';
import { UnitApiService } from './data-access/unit-api.service';
import { UnitUpsertRequest } from './models/unit.model';

type UnitField = 'code' | 'name' | 'symbol';

@Component({
  selector: 'app-unit-form-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AlertComponent,
    ButtonComponent,
    ContentContainerComponent,
    InputComponent,
    PageHeaderComponent,
    SkeletonComponent,
  ],
  templateUrl: './unit-form-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnitFormPage implements OnInit {
  private readonly api = inject(UnitApiService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly id = this.route.snapshot.paramMap.get('id');
  readonly editing = this.id !== null;
  readonly loading = signal(this.editing);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly serverErrors = signal<Partial<Record<UnitField, string>>>({});

  readonly form = this.formBuilder.nonNullable.group({
    code: ['', [Validators.required, Validators.maxLength(50)]],
    name: ['', [Validators.required, Validators.maxLength(150)]],
    symbol: ['', [Validators.required, Validators.maxLength(20)]],
  });

  ngOnInit(): void {
    if (!this.id) {
      this.loading.set(false);
      return;
    }

    this.api.get(this.id).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (item) => this.form.reset({ code: item.code, name: item.name, symbol: item.symbol }),
      error: (error: unknown) => this.setError(error, 'Unable to load unit.'),
    });
  }

  submit(): void {
    this.error.set('');
    this.serverErrors.set({});

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const request: UnitUpsertRequest = {
      code: value.code.trim(),
      name: value.name.trim(),
      symbol: value.symbol.trim(),
    };

    this.saving.set(true);
    const operation = this.id ? this.api.update(this.id, request) : this.api.create(request);

    operation.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => this.router.navigate(['/master-data/units']),
      error: (error: unknown) => this.handleSaveError(error),
    });
  }

  fieldError(field: UnitField): string {
    const serverError = this.serverErrors()[field];
    if (serverError) return serverError;

    const control = this.form.controls[field];
    if (!control.touched) return '';
    if (control.hasError('required')) return 'This field is required.';
    if (control.hasError('maxlength')) return 'Value is too long.';
    return '';
  }

  private handleSaveError(error: unknown): void {
    if (error instanceof ApiHttpError && error.validationErrors?.length) {
      const mapped: Partial<Record<UnitField, string>> = {};

      for (const validationError of error.validationErrors) {
        if (validationError.field in this.form.controls && validationError.messages.length) {
          mapped[validationError.field as UnitField] = validationError.messages[0];
        }
      }

      this.serverErrors.set(mapped);
    }

    this.setError(error, 'Unable to save unit.');
  }

  private setError(error: unknown, fallback: string): void {
    this.error.set(error instanceof ApiHttpError ? error.message : fallback);
  }
}
