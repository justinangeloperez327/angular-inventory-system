import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  template: `<span class="skeleton" [style.width]="width" [style.height]="height" aria-hidden="true"></span>`,
  styleUrl: './skeleton.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonComponent {
  @Input() width = '100%';
  @Input() height = '1rem';
}
