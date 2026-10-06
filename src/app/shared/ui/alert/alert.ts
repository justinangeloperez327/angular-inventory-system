import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

const VARIANT_CLASSES: Record<AlertVariant, string> = {
  info: 'border-l-primary',
  success: 'border-l-success',
  warning: 'border-l-warning',
  danger: 'border-l-danger',
};

@Component({
  selector: 'app-alert',
  templateUrl: './alert.html',
  host: {
    class: 'block',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertComponent {
  @Input() title = '';
  @Input() variant: AlertVariant = 'info';

  get alertClasses(): string {
    return `border border-border border-l-[3px] bg-surface px-3.5 py-3 text-base ${VARIANT_CLASSES[this.variant]}`;
  }
}
