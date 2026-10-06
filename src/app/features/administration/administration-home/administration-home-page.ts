import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PERMISSIONS } from '../../../core/auth/permissions';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { ContentContainerComponent } from '../../../shared/ui/content-container/content-container';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';

@Component({
  selector: 'app-administration-home-page',
  imports: [
    RouterLink,
    HasPermissionDirective,
    ContentContainerComponent,
    PageHeaderComponent,
  ],
  templateUrl: './administration-home-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdministrationHomePage {
  readonly permissions = PERMISSIONS;
}
