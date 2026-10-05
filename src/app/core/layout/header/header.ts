import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Output,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthSessionService } from '../../auth/auth-session.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly router = inject(Router);
  readonly session = inject(AuthSessionService);

  readonly loggingOut = signal(false);
  @Output() readonly menuRequested = new EventEmitter<void>();

  logout(): void {
    if (this.loggingOut()) {
      return;
    }

    this.loggingOut.set(true);

    this.session
      .logout()
      .pipe(finalize(() => this.loggingOut.set(false)))
      .subscribe(() => this.router.navigateByUrl('/auth/login', { replaceUrl: true }));
  }
}
