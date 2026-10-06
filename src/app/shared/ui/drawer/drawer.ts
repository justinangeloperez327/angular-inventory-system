import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-drawer',
  templateUrl: './drawer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawerComponent {
  @Input() open = false;
  @Input() title = '';
  @Output() readonly closed = new EventEmitter<void>();
}
