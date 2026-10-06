import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EventEmitter,
  HostListener,
  inject,
  Input,
  Output,
} from '@angular/core';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AuthorizationService } from '../../auth/authorization.service';
import { NAVIGATION_SECTIONS } from '../navigation';
import { NavigationIconComponent } from '../navigation-icon/navigation-icon';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, CdkTrapFocus, NavigationIconComponent],
  templateUrl: './sidebar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  @Input() open = false;
  @Output() readonly closed = new EventEmitter<void>();

  private readonly authorization = inject(AuthorizationService);

  readonly sections = computed(() =>
    NAVIGATION_SECTIONS.map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        this.authorization.can(item.permissions ?? [], item.permissionMode ?? 'all'),
      ),
    })).filter((section) => section.items.length > 0),
  );

  @HostListener('document:keydown.escape')
  closeOnEscape(): void {
    if (this.open) {
      this.closed.emit();
    }
  }

  @HostListener('window:resize')
  closeOnDesktopResize(): void {
    if (
      this.open &&
      typeof window !== 'undefined' &&
      window.matchMedia('(min-width: 64rem)').matches
    ) {
      this.closed.emit();
    }
  }

  closeAfterNavigation(): void {
    if (typeof window !== 'undefined' && !window.matchMedia('(min-width: 64rem)').matches) {
      this.closed.emit();
    }
  }
}
