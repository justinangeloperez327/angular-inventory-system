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
import { TextareaComponent } from '../../../shared/ui/textarea/textarea';
import { CategoryApiService } from './data-access/category-api.service';
import { CategoryUpsertRequest } from './models/category.model';

type CategoryField = 'code' | 'name' | 'description';

@Component({
  selector: 'app-category-form-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AlertComponent,
    ButtonComponent,
    ContentContainerComponent,
    InputComponent,
    PageHeaderComponent,
    SkeletonComponent,
    TextareaComponent,
  ],
  templateUrl: './category-form-page.html',
  styleUrl: '../master-data-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryFormPage implements OnInit {
  private readonly api = inject(CategoryApiService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly id = this.route.snapshot.paramMap.get('id');
  readonly editing = this.id !== null;
  readonly loading = signal(this.editing);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly serverErrors = signal<Partial<Record<CategoryField, string>>>({});

  readonly form = this.formBuilder.nonNullable.group({
    code: ['', [Validators.required, Validators.maxLength(50)]],
    name: ['', [Validators.required, Validators.maxLength(150)]],
    description: ['', [Validators.maxLength(1000)]],
  });

  ngOnInit(): void {
    if (!this.id) {
      this.loading.set(false);
      return;
    }

    this.api.get(this.id).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (item) => this.form.reset({
        code: item.code,
        name: item.name,
        description: item.description ?? '',
      }),
      error: (error: unknown) => this.setError(error, 'Unable to load category.'),
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
    const request: CategoryUpsertRequest = {
      code: value.code.trim(),
      name: value.name.trim(),
      description: value.description.trim() || undefined,
    };

    this.saving.set(true);
    const operation = this.id ? this.api.update(this.id, request) : this.api.create(request);

    operation.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => this.router.navigate(['/master-data/categories']),
      error: (error: unknown) => this.handleSaveError(error),
    });
  }

  fieldError(field: CategoryField): string {
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
      const mapped: Partial<Record<CategoryField, string>> = {};

      for (const validationError of error.validationErrors) {
        if (validationError.field in this.form.controls && validationError.messages.length) {
          mapped[validationError.field as CategoryField] = validationError.messages[0];
        }
      }

      this.serverErrors.set(mapped);
    }

    this.setError(error, 'Unable to save category.');
  }

  private setError(error: unknown, fallback: string): void {
    this.error.set(error instanceof ApiHttpError ? error.message : fallback);
  }
}
