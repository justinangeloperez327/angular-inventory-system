import { computed, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HttpLoadingService {
  private readonly pendingRequests = signal(0);

  readonly isLoading = computed(() => this.pendingRequests() > 0);
  readonly pending = this.pendingRequests.asReadonly();

  begin(): void {
    this.pendingRequests.update((count) => count + 1);
  }

  end(): void {
    this.pendingRequests.update((count) => Math.max(0, count - 1));
  }
}
