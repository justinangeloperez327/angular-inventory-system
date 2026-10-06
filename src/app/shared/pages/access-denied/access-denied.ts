import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ContentContainerComponent } from '../../ui/content-container/content-container';
import { EmptyStateComponent } from '../../ui/empty-state/empty-state';

@Component({
  selector: 'app-access-denied',
  imports: [ContentContainerComponent, EmptyStateComponent],
  templateUrl: './access-denied.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessDeniedPage {}
