import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ContentContainerComponent } from '../../shared/ui/content-container/content-container';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header';

@Component({
  selector: 'app-master-data-index-page',
  imports: [RouterLink, ContentContainerComponent, PageHeaderComponent],
  templateUrl: './master-data-index-page.html',
  styleUrl: './master-data-index-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MasterDataIndexPage {}
