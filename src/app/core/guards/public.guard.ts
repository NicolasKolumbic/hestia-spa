import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const publicGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.getProfile().pipe(
        map((user) => {
            if (user) {
                // User is authenticated, redirect to dashboard
                router.navigate(['/platform/dashboard']);
                return false;
            }
            // User is not authenticated, allow access to public auth pages
            return true;
        }),
        catchError(() => {
            // Error means not authenticated (401), so allow access
            return of(true);
        })
    );
};
