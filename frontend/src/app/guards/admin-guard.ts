import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service/auth-service';

export const adminGuard: CanActivateFn = () => {
  return inject(AuthService).isAdmin() ? true : inject(Router).createUrlTree(['/dashboard/vaults']);
};
