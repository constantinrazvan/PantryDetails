import { Service } from '@angular/core';

@Service()
export class ApiErrorService {
  message(err: any, fallback = 'Something went wrong. Please try again.'): string {
    if (err.status === 0) {
      return 'The server is not responding. Check that the backend is running.';
    }
    if (err.error && err.error.message) {
      return err.error.message;
    }
    return fallback;
  }
}
