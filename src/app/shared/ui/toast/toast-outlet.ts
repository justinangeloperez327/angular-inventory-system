import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-outlet',
  templateUrl: './toast-outlet.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastOutletComponent {
  readonly toastService = inject(ToastService);
}
