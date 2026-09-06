import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, FormsModule, Validators } from '@angular/forms';
import { DrawerBody } from '@shared/components/drawer/interfaces/drawer-body';
import { DrawerRef } from '@shared/components/drawer/interfaces/drawer-ref';
import { FloatLabelInput } from "@shared/components/float-label-input/float-label-input";
import { ReactiveFormsModule } from '@angular/forms';
import { SpaceService } from '@core/index';
import { AccessManagmentScope } from '../access-managment-scope/access-managment-scope';
import { Checkbox } from 'primeng/checkbox';
import { PermissionScope } from '@core/domain/models/permission-scope';
import { UserManagment } from '../../models/user-managment';
import { AccessManagmentService } from '../../services/access-managment.service';
import { InviteUserPayload } from '../../interfaces/invite-user-payload.interface';
import { PermissionDto } from '../../interfaces/permission-dto';
import { map, Observable, switchMap } from 'rxjs';
import { UpdatePermissionRequestDto } from '../../interfaces/update-permission-request.dto';

@Component({
  selector: 'hta-user-detail-form',
  imports: [
    ReactiveFormsModule, FloatLabelInput, AccessManagmentScope, Checkbox, FormsModule
  ],
  templateUrl: './user-detail-form.html',
  styleUrl: './user-detail-form.css',
})
export class UserDetailForm implements DrawerBody, OnInit {
  drawerRef = input.required<DrawerRef>();
  accessUser = input<UserManagment | null>();
  isReadonly = input<boolean>(false);
  isEditing = input<boolean>(false);

  #formBuilder = inject(FormBuilder);
  #spacesService = inject(SpaceService);
  #accessManagmentService = inject(AccessManagmentService);

  topologyNodes = signal<PermissionScope[]>([]);
  invitationForm = this.#formBuilder.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', Validators.required],
    totalClient: [false]
  });

  selectedPermission = signal<PermissionScope[]>([]);
  updatePermission = signal<UpdatePermissionRequestDto | undefined>(undefined);

  ngOnInit(): void {
    this.#spacesService.getTopology().pipe(switchMap((nodes: PermissionScope[]) => {
      return this.#patchUserFormAndNodes(nodes);
    })).pipe(map((permissions: PermissionDto[]) => {
      return this.#patchSelectedPermission(permissions);
    })).subscribe();

    this.drawerRef().getData(() => {
      if (this.isEditing()) {
        return this.#updatePermission();
      }
      return this.#addPermissions();
    });
  }

  onScopeUpdate(permissions: UpdatePermissionRequestDto) {
    this.updatePermission.set(permissions);
  }

  #patchUserFormAndNodes(nodes: PermissionScope[]): Observable<PermissionDto[]> {
    this.invitationForm.patchValue({
      firstName: this.accessUser()?.firstName ?? '',
      lastName: this.accessUser()?.lastName ?? '',
      email: this.accessUser()?.email ?? '',
      totalClient: false
    });

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

  #addPermissions(): InviteUserPayload {
    const { firstName, lastName, email, totalClient } = this.invitationForm.value;

    return {
      firstName,
      lastName,
      email,
      permissions: this.selectedPermission()?.map((permission: PermissionScope) => permission.toRequestDto()) || [],
    } as InviteUserPayload;
  }

  #updatePermission(): UpdatePermissionRequestDto {
    const request: UpdatePermissionRequestDto = {};
    const { firstName, lastName } = this.invitationForm.value;

    if (this.updatePermission()) {
      if (this.updatePermission()!.toDelete) {
        request.toDelete = this.updatePermission()!.toDelete;
      }
      if (this.updatePermission()!.toUpdate) {
        request.toUpdate = this.updatePermission()!.toUpdate;
      }
      if (this.updatePermission()!.toAdd) {
        request.toAdd = this.updatePermission()!.toAdd;
      }
    }

    request["userId"] = this.accessUser()?.userId;

    if (firstName) {
      request["firstName"] = firstName;
    }
    if (lastName) {
      request["lastName"] = lastName;
    }

    return request;
  }
}
