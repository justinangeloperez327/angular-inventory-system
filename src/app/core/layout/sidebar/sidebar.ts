import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AuthorizationService } from '../../auth/authorization.service';
import { NAVIGATION_SECTIONS } from '../navigation';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  @Input() open = false;
  @Output() readonly closed = new EventEmitter<void>();

  private readonly authorization = inject(AuthorizationService);

  readonly sections = computed(() =>
    NAVIGATION_SECTIONS.map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        this.authorization.can(item.permissions ?? [], item.permissionMode ?? 'all'),
      ),
    })).filter((section) => section.items.length > 0),
  );
}
