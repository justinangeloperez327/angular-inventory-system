import {
  ChangeDetectionStrategy,
  Component,
  signal,
  ViewChild,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ToastOutletComponent } from '../../../shared/ui/toast/toast-outlet';
import { HeaderComponent } from '../header/header';
import { SidebarComponent } from '../sidebar/sidebar';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, ToastOutletComponent],
  templateUrl: './app-shell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent {
  @ViewChild(HeaderComponent)
  private header?: HeaderComponent;

  readonly mobileNavigationOpen = signal(false);

  openNavigation(): void {
    this.mobileNavigationOpen.set(true);
  }

  closeNavigation(): void {
    const wasOpen = this.mobileNavigationOpen();

    this.mobileNavigationOpen.set(false);

    if (wasOpen) {
      queueMicrotask(() => this.header?.focusMenuButton());
    }
  }
}
