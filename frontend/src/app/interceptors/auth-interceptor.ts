import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth-service/auth-service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.getToken();
  if (token) {
    req = req.clone({ setHeaders: { Authorization: 'Bearer ' + token } });
  }

  return next(req).pipe(
    catchError((error) => {
      // expired token -> back to login (but not for the login request itself)
      if (error.status === 401 && !req.url.includes('/auth/')) {
        auth.logout();
      }
      if (error.status === 403 && error.error && error.error.code === 'PASSWORD_CHANGE_REQUIRED') {
        router.navigate(['/change-password']);
      }
      return throwError(() => error);
    }),
  );
};
