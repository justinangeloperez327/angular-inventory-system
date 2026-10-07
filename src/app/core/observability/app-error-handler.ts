import { ErrorHandler, Injectable } from '@angular/core';

import { ClientDiagnosticsService } from './client-diagnostics.service';

@Injectable()
export class AppErrorHandler implements ErrorHandler {
  constructor(private readonly diagnostics: ClientDiagnosticsService) {}

  handleError(error: unknown): void {
    this.diagnostics.captureUnhandled(error);
  }
}
