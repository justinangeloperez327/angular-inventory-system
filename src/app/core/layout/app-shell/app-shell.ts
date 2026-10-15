import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  signal,
  ViewChild,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ToastOutletComponent } from '../../../shared/ui/toast/toast-outlet';
import { CommandPaletteComponent } from '../../command-palette/command-palette';
import { HeaderComponent } from '../header/header';
import { SidebarComponent } from '../sidebar/sidebar';

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    CommandPaletteComponent,
    ToastOutletComponent,
  ],
  templateUrl: './app-shell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent {
  @ViewChild(HeaderComponent)
  private header?: HeaderComponent;

  readonly mobileNavigationOpen = signal(false);
  readonly commandPaletteOpen = signal(false);
  readonly commandPaletteSeed = signal('');

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

  openCommandPalette(seed = ''): void {
    this.mobileNavigationOpen.set(false);
    this.commandPaletteSeed.set(seed);
    this.commandPaletteOpen.set(true);
  }

  closeCommandPalette(): void {
    const wasOpen = this.commandPaletteOpen();

    this.commandPaletteOpen.set(false);

    if (wasOpen) {
      queueMicrotask(() => this.header?.focusCommandButton());
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleGlobalShortcut(event: KeyboardEvent): void {
    const key = event.key.toLocaleLowerCase();

    if ((event.ctrlKey || event.metaKey) && key === 'k') {
      event.preventDefault();

      if (this.commandPaletteOpen()) {
        this.closeCommandPalette();
      } else {
        this.openCommandPalette();
      }

      return;
    }

    if (
      this.commandPaletteOpen() ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      this.isEditableTarget(event.target)
    ) {
      return;
    }

    if (key === '/' || key === 'f') {
      event.preventDefault();
      this.openCommandPalette();
      return;
    }

    if (key === 'n') {
      event.preventDefault();
      this.openCommandPalette('new');
    }
  }

  private isEditableTarget(target: EventTarget | null): boolean {
    return (
      target instanceof HTMLElement &&
      Boolean(target.closest('input, textarea, select, [contenteditable="true"]'))
    );
  }
}
