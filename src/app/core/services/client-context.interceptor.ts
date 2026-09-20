import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Environment } from './environment';
import { inject } from '@angular/core';

export const clientContextInterceptor: HttpInterceptorFn = (req, next) => {
  const env = inject(Environment);

  // Only attach X-Client-Id to requests destined for hestia-web-api
  if (!req.url.startsWith(env.apiUrl)) {
    return next(req);
  }

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
};
