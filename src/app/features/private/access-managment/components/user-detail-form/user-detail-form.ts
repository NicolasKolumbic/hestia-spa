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

  #formBuilder = inject(FormBuilder);
  #spacesService = inject(SpaceService);
  #accessManagmentService = inject(AccessManagmentService);

  topologyNodes = signal<PermissionScope[]>([]);
  invitationForm = this.#formBuilder.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', Validators.required],
    assignments: [[]],
    totalClient: [false]
  });

  ngOnInit(): void {
    this.#spacesService.getTopology().subscribe((nodes: PermissionScope[]) => {
      this.invitationForm.patchValue({
        firstName: this.accessUser()?.firstName ?? '',
        lastName: this.accessUser()?.lastName ?? '',
        email: this.accessUser()?.email ?? '',
        totalClient: false
      });
      this.topologyNodes.set(nodes);
    });

    if (this.accessUser() && this.accessUser()!.userId) {
      this.#accessManagmentService.getAssigmentsByUser(this.accessUser()!.userId).subscribe((assigments) => {
        console.log(assigments);
      });
    }

    this.drawerRef().getData(() => {
      return this.invitationForm.value;
    });
  }

  onScopeUpdate(scope: PermissionScope[]) {
    console.log(scope);
  }
}
