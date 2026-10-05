import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-content-container',
  template: `<div class="content-container"><ng-content /></div>`,
  styleUrl: './content-container.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentContainerComponent {}
