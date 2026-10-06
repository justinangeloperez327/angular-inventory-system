import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ContentContainerComponent } from '../../ui/content-container/content-container';
import { EmptyStateComponent } from '../../ui/empty-state/empty-state';

@Component({
  selector: 'app-not-found-page',
  imports: [ContentContainerComponent, EmptyStateComponent],
  templateUrl: './not-found.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPage {}
