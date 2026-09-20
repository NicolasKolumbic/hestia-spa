import { HttpInterceptorFn } from '@angular/common/http';
import { Environment } from './environment';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const env = inject(Environment);

  // Only attach withCredentials: true to requests destined for hestia-web-api
  if (!req.url.startsWith(env.apiUrl)) {
    return next(req);
  }

  const authReq = req.clone({
    withCredentials: true
  });
  return next(authReq);
};
