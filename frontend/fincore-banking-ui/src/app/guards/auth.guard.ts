// FEATURE: Protect routes that require authentication

import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router
} from '@angular/router';

import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // FEATURE: Allow navigation only with a valid, unexpired token
  if (authService.isLoggedIn()) {
    return true;
  }

  // FEATURE: Clear invalid session and redirect to login
  authService.logout();

  return router.createUrlTree(['/login'], {
    queryParams: {
      returnUrl: state.url
    }
  });
};