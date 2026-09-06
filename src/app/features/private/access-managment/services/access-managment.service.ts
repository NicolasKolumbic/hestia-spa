import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { map, Observable, switchMap } from 'rxjs';
import { Environment } from '@core/services/environment';

import { ListUsersQuery } from '../interfaces/list-users-query.interface';
import { InviteUserPayload } from '../interfaces/invite-user-payload.interface';
import { UpdateRoleAssignmentPayload } from '../interfaces/update-role-assignment-payload.interface';
import { UserAccess } from '../interfaces/user-access.interface';
import { AccessSummaryResponse } from '../interfaces/access-summary-response.interface';
import { CatalogSite } from '../interfaces/catalog-site.interface';
import { AccessUserDetail } from '../interfaces/access-user-detail.interface';
import { InviteUserResult } from '../interfaces/invite-user-result.interface';
import { UpdateRoleAssignmentResult } from '../interfaces/update-role-assignment-result.interface';
import { GridResponse } from '@core/domain/interfaces/grid-response.interface';
import { UserManagment } from "../models/user-managment";
import { AccessUser } from "../interfaces/access-user.interface";
import { UserManagmentDto } from "../dtos/user-managment.dto";
import { PermissionScope } from "@core/domain/models/permission-scope";
import { PermissionDto } from "../interfaces/permission-dto";
import { UpdatePermissionRequestDto } from "../interfaces/update-permission-request.dto";

@Injectable({
    providedIn: 'root',
})
export class AccessManagmentService {
    #http = inject(HttpClient);
    #environment = inject(Environment);

    private get apiUrl(): string {
        return `${this.#environment.apiUrl}/access-managment`;
    }

    listUsers({ roleCode, scopeType, search, status }: ListUsersQuery): Observable<GridResponse<UserManagment>> {
        let params: any = {};
        if (search) params['search'] = search;
        if (status && status.length > 0) params['status'] = status;
        if (roleCode && roleCode.length > 0) params['roleCode'] = roleCode;
        if (scopeType && scopeType.length > 0) params['scopeType'] = scopeType;

        return this.#http.get<GridResponse<UserManagmentDto>>(`${this.apiUrl}/users`, { params }).pipe(map((res) => {
            return {
                ...res,
                items: res.items.map(item => new UserManagment(item))
            }
        }));
    }

    getSummary(clientId: string): Observable<AccessSummaryResponse> {
        const params = new HttpParams().set('clientId', clientId);
        return this.#http.get<AccessSummaryResponse>(`${this.apiUrl}/summary`, { params });
    }

    getCatalog(clientId: string): Observable<CatalogSite[]> {
        const params = new HttpParams().set('clientId', clientId);
        return this.#http.get<CatalogSite[]>(`${this.apiUrl}/catalog`, { params });
    }

    getUserDetail(clientId: string, userId: string): Observable<AccessUserDetail> {
        const params = new HttpParams().set('clientId', clientId);
        return this.#http.get<AccessUserDetail>(`${this.apiUrl}/users/${userId}`, { params });
    }

    getAssigmentsByUser(userId: string): Observable<PermissionDto[]> {
        return this.#http.get<PermissionDto[]>(`${this.apiUrl}/users/${userId}/assignments`);
    }

    inviteUser(payload: InviteUserPayload): Observable<GridResponse<UserManagment>> {
        return this.#http.post<InviteUserResult>(`${this.apiUrl}/users/invite`, payload).pipe(switchMap(() => this.listUsers({})))
    }

    updateRoleAssignment(userId: string, payload: UpdatePermissionRequestDto): Observable<GridResponse<UserManagment>> {
        return this.#http.put<UpdateRoleAssignmentResult>(`${this.apiUrl}/users/${userId}/assignments`, payload).pipe(switchMap(() => this.listUsers({})))
    }

    removeUser(clientId: string, userId: string, assignmentId: string): Observable<void> {
        const params = new HttpParams().set('clientId', clientId);
        return this.#http.delete<void>(`${this.apiUrl}/users/${userId}/assignments/${assignmentId}`, { params });
    }
}