import {
  Directive,
  effect,
  inject,
  input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

import {
  AuthorizationService,
} from '../../core/auth/authorization.service';
import {
  Permission,
  PermissionMode,
} from '../../core/auth/permissions';

@Directive({
  selector: '[appHasPermission]',
})
export class HasPermissionDirective {
  readonly appHasPermission = input.required<Permission | readonly Permission[]>();
  readonly appHasPermissionMode = input<PermissionMode>('all');

  private readonly authorization = inject(AuthorizationService);
  private readonly template = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private rendered = false;

  private readonly visibilityEffect = effect(() => {
    const value = this.appHasPermission();
    const required = typeof value === 'string' ? [value] : value;
    const allowed = this.authorization.can(required, this.appHasPermissionMode());

    if (allowed && !this.rendered) {
      this.viewContainer.createEmbeddedView(this.template);
      this.rendered = true;
      return;
    }

    if (!allowed && this.rendered) {
      this.viewContainer.clear();
      this.rendered = false;
    }
  });
}
