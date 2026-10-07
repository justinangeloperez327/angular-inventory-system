import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

const BASE_CLASSES =
  'inline-flex min-h-5 items-center rounded-sm border px-1.5 py-0.5 text-[0.6875rem] font-semibold leading-4 tracking-[0.01em]';

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  neutral: 'border-border bg-surface-muted text-muted-foreground',
  success: 'border-success/20 bg-success/10 text-success',
  warning: 'border-warning/20 bg-warning/10 text-warning',
  danger: 'border-danger/20 bg-danger/10 text-danger',
  info: 'border-primary/20 bg-primary/10 text-primary',
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
