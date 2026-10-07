import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md';

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded-sm border font-medium shadow-control transition-[background-color,border-color,box-shadow,transform] duration-100 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0';

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'min-h-control-sm px-2.5 text-sm',
  md: 'min-h-control px-3.5 text-base',
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'border-primary bg-primary text-primary-foreground hover:border-primary-hover hover:bg-primary-hover',
  secondary:
    'border-border bg-surface text-foreground hover:border-border-strong hover:bg-surface-muted',
  ghost:
    'border-transparent bg-transparent text-foreground shadow-none hover:bg-surface-muted',
  danger:
    'border-danger bg-danger text-white hover:opacity-90',
};

@Component({
  selector: 'app-button',
  templateUrl: './button.html',
  host: {
    class: 'inline-flex',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() disabled = false;
  @Input() loading = false;

  get buttonClasses(): string {
    return `${BASE_CLASSES} ${SIZE_CLASSES[this.size]} ${VARIANT_CLASSES[this.variant]}`;
  }
}
