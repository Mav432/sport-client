import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastr = inject(ToastrService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isHttpError = error instanceof HttpErrorResponse;
      const isGetRequest = req.method === 'GET';
      const hasValidationDetails = !!(error?.error?.errors || error?.error?.validationErrors);

      if (isHttpError) {
        if (error.status === 400 && isGetRequest && !hasValidationDetails) {
          router.navigate(['/error/400'], { state: { from: req.url } });
        }

        if (error.status === 404 && isGetRequest) {
          router.navigate(['/error/404']);
        }

        if ((error.status >= 500 || error.status === 0) && isGetRequest) {
          router.navigate(['/error/500']);
        }

        if (error.status >= 500) {
          toastr.error('Tuvimos un problema inesperado. Nuestro equipo ya lo está revisando.', 'Ups… algo falló');
        }
      }

      return throwError(() => error);
    })
  );
};
