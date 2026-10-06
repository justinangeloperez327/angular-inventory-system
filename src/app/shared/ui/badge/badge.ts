import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

const BASE_CLASSES =
  'inline-flex min-h-6 items-center rounded-full border px-2 py-0.5 text-xs font-semibold';

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  neutral: 'border-border bg-surface-muted text-muted-foreground',
  success: 'border-success bg-surface text-success',
  warning: 'border-warning bg-surface text-warning',
  danger: 'border-danger bg-surface text-danger',
  info: 'border-primary bg-surface text-primary',
};

@Component({
  selector: 'app-badge',
  template: `<span [class]="badgeClasses"><ng-content /></span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'neutral';

  get badgeClasses(): string {
    return `${BASE_CLASSES} ${VARIANT_CLASSES[this.variant]}`;
  }
}
