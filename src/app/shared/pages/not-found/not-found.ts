import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ContentContainerComponent } from '../../ui/content-container/content-container';
import { PageHeaderComponent } from '../../ui/page-header/page-header';

@Component({
  selector: 'app-not-found-page',
  imports: [ContentContainerComponent, PageHeaderComponent],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPage {}
