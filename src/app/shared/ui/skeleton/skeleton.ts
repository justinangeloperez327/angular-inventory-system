import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  template: `
    <span
      class="block max-w-full animate-pulse rounded-sm bg-surface-strong"
      [style.width]="width"
      [style.height]="height"
      aria-hidden="true"
    ></span>
  `,
  host: {
    class: 'block',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonComponent {
  @Input() width = '100%';
  @Input() height = '1rem';
}
