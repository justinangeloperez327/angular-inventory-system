import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthSessionService } from '../../../core/auth/auth-session.service';
import { ApiHttpError } from '../../../core/http/api-http-error';
import { AlertComponent } from '../../../shared/ui/alert/alert';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { InputComponent } from '../../../shared/ui/input/input';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, AlertComponent, ButtonComponent, InputComponent],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly session = inject(AuthSessionService);

  readonly submitting = signal(false);
  readonly formError = signal('');

  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  submit(): void {
    this.formError.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    this.session
      .login(this.form.getRawValue())
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => this.router.navigateByUrl(this.safeReturnUrl(), { replaceUrl: true }),
        error: (error: unknown) => {
          this.formError.set(this.loginErrorMessage(error));
        },
      });
  }

  emailError(): string {
    const control = this.form.controls.email;

    if (!control.touched) {
      return '';
    }

    if (control.hasError('required')) {
      return 'Email is required.';
    }

    return control.hasError('email') ? 'Enter a valid email address.' : '';
  }

  passwordError(): string {
    const control = this.form.controls.password;

    return control.touched && control.hasError('required') ? 'Password is required.' : '';
  }

  private loginErrorMessage(error: unknown): string {
    if (!(error instanceof ApiHttpError)) {
      return 'Unable to sign in. Please try again.';
    }

    return error.status === 401 ? 'Email or password is incorrect.' : error.message;
  }

  private safeReturnUrl(): string {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

    if (
      !returnUrl ||
      !returnUrl.startsWith('/') ||
      returnUrl.startsWith('//') ||
      returnUrl.startsWith('/auth')
    ) {
      return '/dashboard';
    }

    return returnUrl;
  }
}
