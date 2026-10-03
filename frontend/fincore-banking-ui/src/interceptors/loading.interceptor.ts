import { HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../app/services/loading.service';


export function loadingInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
) {

  // Gets the loading service.
  const loadingService = inject(LoadingService);

  // Shows the loader before the API call.
  loadingService.show();

  // Hides the loader after the API call completes.
  return next(request).pipe(
    finalize(() => {
      loadingService.hide();
    })
  );
}