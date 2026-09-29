import { HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

// Adds the JWT token and handles unauthorized responses.
export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const router = inject(Router);
  const token = localStorage.getItem('token');

  // Adds the JWT token to the request.
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(

    // Handles expired or invalid JWT tokens.
    catchError((error) => {

      if (error.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('authUser');

        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};