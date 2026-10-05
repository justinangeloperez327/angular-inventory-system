import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ContentContainerComponent } from '../../ui/content-container/content-container';
import { PageHeaderComponent } from '../../ui/page-header/page-header';

@Component({
  selector: 'app-feature-placeholder',
  imports: [ContentContainerComponent, PageHeaderComponent],
  templateUrl: './feature-placeholder.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturePlaceholderPage {
  private readonly route = inject(ActivatedRoute);

  readonly title = this.route.snapshot.data['title'] as string;
  readonly description = this.route.snapshot.data['description'] as string;
}
