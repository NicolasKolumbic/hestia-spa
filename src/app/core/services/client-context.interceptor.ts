import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';

export const clientContextInterceptor: HttpInterceptorFn = (req, next) => {
  // TODO: Read this dynamically from a global state/store once implemented
  const auth = inject(AuthService);

  if (auth.user && auth.user.clients && auth.user.clients.length > 0) {
    const clientId = auth.user.clients[0].clientId;

    const modifiedReq = req.clone({
      headers: req.headers.set('x-client-id', clientId)
    });

    return next(modifiedReq);
  }

  return next(req);
}
