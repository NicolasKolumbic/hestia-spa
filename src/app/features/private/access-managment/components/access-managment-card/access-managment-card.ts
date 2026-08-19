import { Component, inject, input } from '@angular/core';
import { Card } from "@shared/components/card/card";
import { UserManagment } from '../../models/user-managment';
import { DrawerManagerService } from '@shared/components/drawer/services/drawer-manager.service';
import { UserDetailForm } from '../user-detail-form/user-detail-form';
import { UserAccessScopeTag } from "@shared/components/user-access-status-tag/user-access-status-tag";
import { UserInfo } from "@shared/components/user-info/user-info";

@Component({
  selector: 'hta-access-managment-card',
  imports: [Card, UserAccessScopeTag, UserInfo],
  templateUrl: './access-managment-card.html',
  styleUrl: './access-managment-card.css',
})
export class AccessManagmentCard {
  user = input.required<UserManagment>();

  #drawerManager = inject(DrawerManagerService);

  openUserDrawer(): void {
    const updatedUser = this.#drawerManager.open<UserManagment>({
      component: UserDetailForm,
      title: 'Detalle de acceso',
      inputs: {
        accessUser: this.user()
      }
    });

    updatedUser.confirmed().subscribe(user => {

    });
  }
}
