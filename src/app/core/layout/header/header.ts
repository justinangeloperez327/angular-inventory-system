import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  Output,
  signal,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthSessionService } from '../../auth/auth-session.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly router = inject(Router);
  readonly session = inject(AuthSessionService);

  @Input() navigationOpen = false;
  @Output() readonly menuRequested = new EventEmitter<void>();

  @ViewChild('menuButton')
  private menuButton?: ElementRef<HTMLButtonElement>;

  readonly loggingOut = signal(false);

  focusMenuButton(): void {
    this.menuButton?.nativeElement.focus();
  }

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
