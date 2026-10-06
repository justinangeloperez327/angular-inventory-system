import { A11yModule } from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';

let dialogSequence = 0;

@Component({
  selector: 'app-dialog',
  imports: [A11yModule],
  templateUrl: './dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() description = '';
  @Output() readonly closed = new EventEmitter<void>();

  readonly titleId = `app-dialog-title-${++dialogSequence}`;
  readonly descriptionId = `app-dialog-description-${dialogSequence}`;

  @HostListener('document:keydown.escape')
  closeOnEscape(): void {
    if (this.open) {
      this.closed.emit();
    }
  }

  onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closed.emit();
    }
  }
}
