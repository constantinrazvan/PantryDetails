import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service/auth-service';

export const passwordChangeGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  if (route.routeConfig && route.routeConfig.path === 'change-password') {
    if (auth.mustChangePassword()) {
      return true;
    }
    return router.createUrlTree(['/dashboard']);
  }

  if (auth.mustChangePassword()) {
    return router.createUrlTree(['/change-password']);
  }
  return true;
};
