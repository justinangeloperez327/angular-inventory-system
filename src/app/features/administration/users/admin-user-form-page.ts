import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, forkJoin, of } from 'rxjs';

import { ApiHttpError } from '../../../core/http/api-http-error';
import { AlertComponent } from '../../../shared/ui/alert/alert';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { ContentContainerComponent } from '../../../shared/ui/content-container/content-container';
import { InputComponent } from '../../../shared/ui/input/input';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton';
import { AdminUserApiService } from '../data-access/admin-user-api.service';
import {
  AdminRoleOption,
  AdminUserUpsertRequest,
} from '../models/admin-user.model';

@Component({
  selector: 'app-admin-user-form-page',
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
  templateUrl: './admin-user-form-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUserFormPage implements OnInit {
  private readonly api = inject(AdminUserApiService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly id = this.route.snapshot.paramMap.get('id');
  readonly editing = this.id !== null;
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly roles = signal<readonly AdminRoleOption[]>([]);

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
    roleIds: this.formBuilder.nonNullable.control<readonly string[]>([], [Validators.minLength(1)]),
  });

  ngOnInit(): void {
    const userRequest = this.id ? this.api.get(this.id) : of(null);

    forkJoin({
      options: this.api.getFormOptions(),
      user: userRequest,
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ options, user }) => {
          this.roles.set(options.roles);

          if (user) {
            this.form.reset({
              name: user.name,
              email: user.email,
              roleIds: user.roles.map((role) => role.id),
            });
          }
        },
        error: (error: unknown) =>
          this.setError(error, 'Unable to load user administration form.'),
      });
  }

  roleSelected(roleId: string): boolean {
    return this.form.controls.roleIds.value.includes(roleId);
  }

  toggleRole(roleId: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const current = this.form.controls.roleIds.value;
    const next = checked
      ? [...new Set([...current, roleId])]
      : current.filter((id) => id !== roleId);

    this.form.controls.roleIds.setValue(next);
    this.form.controls.roleIds.markAsTouched();
    this.form.controls.roleIds.markAsDirty();
  }

  submit(): void {
    this.error.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const request: AdminUserUpsertRequest = {
      name: value.name.trim(),
      email: value.email.trim().toLowerCase(),
      roleIds: value.roleIds,
    };

    this.saving.set(true);
    const operation = this.id ? this.api.update(this.id, request) : this.api.create(request);

    operation
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (user) =>
          this.router.navigate(['/administration/users', user.id], {
            replaceUrl: !this.editing,
          }),
        error: (error: unknown) => this.setError(error, 'Unable to save user.'),
      });
  }

  fieldError(field: 'name' | 'email'): string {
    const control = this.form.controls[field];
    if (!control.touched) return '';
    if (control.hasError('required')) return 'This field is required.';
    if (control.hasError('email')) return 'Enter a valid email address.';
    if (control.hasError('maxlength')) return 'Value is too long.';
    return '';
  }

  roleError(): string {
    const control = this.form.controls.roleIds;
    if (!control.touched) return '';
    return control.hasError('minlength') ? 'Assign at least one role.' : '';
  }

  private setError(error: unknown, fallback: string): void {
    this.error.set(error instanceof ApiHttpError ? error.message : fallback);
  }
}
