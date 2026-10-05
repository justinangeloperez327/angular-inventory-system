import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-dashboard-metric-card',
  templateUrl: './metric-card.html',
  styleUrl: './metric-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricCardComponent {
  @Input() label = '';
  @Input() value: string | number | null = '—';
  @Input() supportingText = '';
  @Input() emphasis: 'default' | 'warning' | 'danger' = 'default';
}
