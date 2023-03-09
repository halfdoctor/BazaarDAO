import * as Sentry from '@sentry/react';

export function captureError (error: unknown): void {
  console.error(error);

  if (import.meta.env.NODE_ENV !== 'development') {
    Sentry.captureMessage((error as Error).message);
  }
}
