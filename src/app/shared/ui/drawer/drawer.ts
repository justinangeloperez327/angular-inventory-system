import { A11yModule } from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';

let drawerSequence = 0;

@Component({
  selector: 'app-drawer',
  imports: [A11yModule],
  templateUrl: './drawer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawerComponent {
  @Input() open = false;
  @Input() title = '';
  @Output() readonly closed = new EventEmitter<void>();

  readonly titleId = `app-drawer-title-${++drawerSequence}`;

  @HostListener('document:keydown.escape')
  closeOnEscape(): void {
    if (this.open) {
      this.closed.emit();
    }
  }
}
