import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

type MetricEmphasis = 'default' | 'warning' | 'danger';

const EMPHASIS_CLASSES: Record<MetricEmphasis, string> = {
  default: 'border-l-border-strong',
  warning: 'border-l-warning',
  danger: 'border-l-danger',
};

@Component({
  selector: 'app-dashboard-metric-card',
  templateUrl: './metric-card.html',
  host: {
    class: 'block min-w-0',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricCardComponent {
  @Input() label = '';
  @Input() value: string | number | null = '—';
  @Input() supportingText = '';
  @Input() emphasis: MetricEmphasis = 'default';

  get cardClasses(): string {
    return `min-h-20 border border-border border-l-[3px] bg-surface px-3 py-2.5 ${EMPHASIS_CLASSES[this.emphasis]}`;
  }
}
