import { Injectable, signal } from '@angular/core';

export type ToastVariant = 'info' | 'success' | 'warning' | 'danger';

export interface ToastMessage {
  readonly id: number;
  readonly message: string;
  readonly variant: ToastVariant;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  readonly messages = signal<readonly ToastMessage[]>([]);

  show(message: string, variant: ToastVariant = 'info', durationMs = 4000): void {
    const toast: ToastMessage = {
      id: ++this.nextId,
      message,
      variant,
    };

    this.messages.update((messages) => [...messages, toast]);

    if (durationMs > 0) {
      globalThis.setTimeout(() => this.dismiss(toast.id), durationMs);
    }
  }

  dismiss(id: number): void {
    this.messages.update((messages) => messages.filter((message) => message.id !== id));
  }
}
