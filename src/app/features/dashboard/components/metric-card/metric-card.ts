import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

type MetricEmphasis = 'default' | 'warning' | 'danger';

const EMPHASIS_CLASSES: Record<MetricEmphasis, string> = {
  default: '',
  warning: 'border-t-2 border-t-warning',
  danger: 'border-t-2 border-t-danger',
};

@Component({
  selector: 'app-dashboard-metric-card',
  templateUrl: './metric-card.html',
  host: {
    class: 'block min-w-0 bg-surface',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricCardComponent {
  @Input() label = '';
  @Input() value: string | number | null = '—';
  @Input() supportingText = '';
  @Input() emphasis: MetricEmphasis = 'default';

  get cardClasses(): string {
    return `min-h-24 bg-surface px-4 py-3.5 ${EMPHASIS_CLASSES[this.emphasis]}`;
  }
}
