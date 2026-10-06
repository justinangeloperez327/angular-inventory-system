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
import { TextareaComponent } from '../../../shared/ui/textarea/textarea';
import { AdminRoleApiService } from '../data-access/admin-role-api.service';
import {
  AdminPermissionGroup,
  AdminRoleUpsertRequest,
} from '../models/admin-role.model';

@Component({
  selector: 'app-admin-role-form-page',
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
  templateUrl: './admin-role-form-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminRoleFormPage implements OnInit {
  private readonly api = inject(AdminRoleApiService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly id = this.route.snapshot.paramMap.get('id');
  readonly editing = this.id !== null;
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly builtIn = signal(false);
  readonly permissionGroups = signal<readonly AdminPermissionGroup[]>([]);

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
    permissions: this.formBuilder.nonNullable.control<readonly string[]>([], [Validators.minLength(1)]),
  });

  ngOnInit(): void {
    const roleRequest = this.id ? this.api.get(this.id) : of(null);

    forkJoin({
      options: this.api.getFormOptions(),
      role: roleRequest,
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ options, role }) => {
          this.permissionGroups.set(options.permissionGroups);

          if (role) {
            this.builtIn.set(role.builtIn);
            this.form.reset({
              name: role.name,
              description: role.description ?? '',
              permissions: role.permissions,
            });

            if (role.builtIn) {
              this.form.controls.name.disable();
            }
          }
        },
        error: (error: unknown) => this.setError(error, 'Unable to load role form.'),
      });
  }

  permissionSelected(key: string): boolean {
    return this.form.controls.permissions.value.includes(key);
  }

  togglePermission(key: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const current = this.form.controls.permissions.value;
    const next = checked
      ? [...new Set([...current, key])]
      : current.filter((permission) => permission !== key);

    this.form.controls.permissions.setValue(next);
    this.form.controls.permissions.markAsTouched();
    this.form.controls.permissions.markAsDirty();
  }

  toggleGroup(group: AdminPermissionGroup, checked: boolean): void {
    const keys = group.permissions.map((permission) => permission.key);
    const current = this.form.controls.permissions.value;
    const next = checked
      ? [...new Set([...current, ...keys])]
      : current.filter((permission) => !keys.includes(permission));

    this.form.controls.permissions.setValue(next);
    this.form.controls.permissions.markAsTouched();
    this.form.controls.permissions.markAsDirty();
  }

  groupSelected(group: AdminPermissionGroup): boolean {
    return group.permissions.every((permission) => this.permissionSelected(permission.key));
  }

  submit(): void {
    this.error.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const request: AdminRoleUpsertRequest = {
      name: value.name.trim(),
      description: value.description.trim() || undefined,
      permissions: value.permissions,
    };

    this.saving.set(true);
    const operation = this.id ? this.api.update(this.id, request) : this.api.create(request);

    operation
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => this.router.navigate(['/administration/roles'], { replaceUrl: true }),
        error: (error: unknown) => this.setError(error, 'Unable to save role.'),
      });
  }

  fieldError(field: 'name' | 'description'): string {
    const control = this.form.controls[field];
    if (!control.touched) return '';
    if (control.hasError('required')) return 'This field is required.';
    if (control.hasError('maxlength')) return 'Value is too long.';
    return '';
  }

  permissionError(): string {
    const control = this.form.controls.permissions;
    if (!control.touched) return '';
    return control.hasError('minlength') ? 'Assign at least one permission.' : '';
  }

  private setError(error: unknown, fallback: string): void {
    this.error.set(error instanceof ApiHttpError ? error.message : fallback);
  }
}
