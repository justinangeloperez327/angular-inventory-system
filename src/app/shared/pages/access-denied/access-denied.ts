import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ContentContainerComponent } from '../../ui/content-container/content-container';

@Component({
  selector: 'app-access-denied',
  imports: [ContentContainerComponent],
  templateUrl: './access-denied.html',
  styleUrl: './access-denied.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessDeniedPage {}
