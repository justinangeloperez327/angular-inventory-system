import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { NavigationIcon } from '../navigation';

@Component({
  selector: 'app-navigation-icon',
  templateUrl: './navigation-icon.html',
  host: {
    class: 'inline-flex size-4 shrink-0',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationIconComponent {
  @Input({ required: true }) name!: NavigationIcon;
}
