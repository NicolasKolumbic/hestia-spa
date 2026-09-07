import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AccessManagmentService } from "@features/private/access-managment/services/access-managment.service";
import { catchError, map, of } from "rxjs";

export const accessManagementGuard: CanActivateFn = () => {
    const accessService = inject(AccessManagmentService);
    const router = inject(Router);
    return accessService.hasHigherAccess().pipe(
        map((res) => res.hasAccess ? true : router.createUrlTree(['/dashboard'])),
        catchError(() => of(router.createUrlTree(['/dashboard'])))
    );
};