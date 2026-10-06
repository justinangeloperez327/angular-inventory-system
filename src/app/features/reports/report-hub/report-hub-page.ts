import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ContentContainerComponent } from '../../../shared/ui/content-container/content-container';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { REPORT_DEFINITIONS } from '../report-definitions';
import { ReportCategory } from '../models/report.model';

@Component({
  selector: 'app-report-hub-page',
  imports: [RouterLink, ContentContainerComponent, PageHeaderComponent],
  templateUrl: './report-hub-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportHubPage {
  readonly categories: readonly ReportCategory[] = ['Inventory', 'Purchasing', 'Sales'];
  readonly definitions = REPORT_DEFINITIONS;

  reportsFor(category: ReportCategory) {
    return this.definitions.filter((definition) => definition.category === category);
  }
}
