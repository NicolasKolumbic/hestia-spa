import { Component, inject, input, output } from '@angular/core';
import { Card } from "@shared/components/card/card";
import { UserManagment } from '../../models/user-managment';
import { DrawerManagerService } from '@shared/components/drawer/services/drawer-manager.service';
import { UserDetailForm } from '../user-detail-form/user-detail-form';
import { UserAccessScopeTag } from "@shared/components/user-access-status-tag/user-access-status-tag";
import { UserInfo } from "@shared/components/user-info/user-info";
import { AccessManagmentService } from '../../services/access-managment.service';
import { UpdatePermissionRequestDto } from '../../interfaces/update-permission-request.dto';
import { GridResponse } from '@core/domain/interfaces/grid-response.interface';

@Component({
  selector: 'hta-access-managment-card',
  imports: [Card, UserAccessScopeTag, UserInfo],
  templateUrl: './access-managment-card.html',
  styleUrl: './access-managment-card.css',
})
export class AccessManagmentCard {
  user = input.required<UserManagment>();

  refresh = output<GridResponse<UserManagment>>();

  #drawerManager = inject(DrawerManagerService);
  #accessManagmentService = inject(AccessManagmentService);

  openUserDrawer(): void {
    const updatedUser = this.#drawerManager.open<UpdatePermissionRequestDto>({
      component: UserDetailForm,
      title: 'Detalle de acceso',
      inputs: {
        accessUser: this.user(),
        isEditing: true
      }
    });

    updatedUser.confirmed().subscribe((request: UpdatePermissionRequestDto) => {
      this.#accessManagmentService.updateRoleAssignment(this.user().userId, request).subscribe((response: GridResponse<UserManagment>) => {
        this.refresh.emit(response);
      });
    });
  }
}
