import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.getProfile().pipe(
        map((user) => {
            if (user) {
                return true;
            }
            router.navigate(['/auth/login']);
            return false;
        }),
        catchError(() => {
            router.navigate(['/auth/login']);
            return of(false);
        })
    );
};
