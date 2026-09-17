
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { DrawerBody } from '@shared/components/drawer/interfaces/drawer-body';
import { DrawerRef } from '@shared/components/drawer/interfaces/drawer-ref';
import { UserManagment } from '../../models/user-managment';
import { SpaceService } from '@core/index';
import { AccessManagmentService } from '../../services/access-managment.service';
import { PermissionScope } from '@core/domain/models/permission-scope';
import { map, Observable, switchMap } from 'rxjs';
import { PermissionDto } from '../../interfaces/permission-dto';
import { AccessManagmentScope } from '../access-managment-scope/access-managment-scope';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'hta-user-details',
    templateUrl: './user-details.html',
    imports: [AccessManagmentScope, CommonModule, FormsModule]
})
export class UserDetails implements DrawerBody, OnInit {
    drawerRef = input.required<DrawerRef>();
    accessUser = input<UserManagment | null>();

    #spacesService = inject(SpaceService);
    #accessManagmentService = inject(AccessManagmentService);

    topologyNodes = signal<PermissionScope[]>([]);
    selectedPermission = signal<PermissionScope[]>([]);

    ngOnInit(): void {
        this.#spacesService.getTopology().pipe(switchMap((nodes: PermissionScope[]) => {
            return this.#patchUserFormAndNodes(nodes);
        })).pipe(map((permissions: PermissionDto[]) => {
            return this.#patchSelectedPermission(permissions);
        })).subscribe();
    }

    #patchUserFormAndNodes(nodes: PermissionScope[]): Observable<PermissionDto[]> {
        this.topologyNodes.set(nodes);

        return this.#accessManagmentService.getAssigmentsByUser(this.accessUser()!.userId);
    }

    #patchSelectedPermission(permissions: PermissionDto[]) {
        const selectedPermissions = this.topologyNodes().filter(({ targetId, type }: PermissionScope) => {
            return permissions.some(({ scopeId, scopeType }: PermissionDto) => scopeId === targetId && scopeType === type);
        }).map((node: PermissionScope) => {
            const permission = permissions.find(({ scopeId, scopeType }: PermissionDto) => scopeId === node.targetId && scopeType === node.type)!;
            node.roleId = permission.roleId;
            node.assignmentId = permission.assignmentId;
            node.checked = true;
            return node;
        });

        this.selectedPermission.set(selectedPermissions);

        return selectedPermissions;
    }
}
