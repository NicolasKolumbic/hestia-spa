import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Environment } from './environment';
import { Observable } from 'rxjs';
import { RoleDto } from '@core/domain/dtos/role.dto';

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  #http = inject(HttpClient);
  #environment = inject(Environment);

  getAllRoles(): Observable<RoleDto[]> {
    return this.#http.get<RoleDto[]>(`${this.#environment.apiUrl}/roles`, { withCredentials: true });
  }
}
