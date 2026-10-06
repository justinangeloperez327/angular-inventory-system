import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-content-container',
  template: `<div class="mx-auto w-full max-w-app px-4 py-5 md:px-6 md:py-6 xl:px-8"><ng-content /></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentContainerComponent {}
