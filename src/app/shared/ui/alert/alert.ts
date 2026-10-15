import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

const VARIANT_CLASSES: Record<AlertVariant, string> = {
  info: 'border-l-primary bg-primary/5',
  success: 'border-l-success bg-success/5',
  warning: 'border-l-warning bg-warning/5',
  danger: 'border-l-danger bg-danger/5',
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
    return `rounded-sm border border-border border-l-[3px] px-3.5 py-3 text-base ${VARIANT_CLASSES[this.variant]}`;
  }
}
