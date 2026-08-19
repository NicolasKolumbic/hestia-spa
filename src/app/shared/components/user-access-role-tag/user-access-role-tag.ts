import { Component, computed, input } from '@angular/core';
import { Roles } from '@shared/enums/roles.enum';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'hta-user-access-role-tag',
  imports: [Tag],
  templateUrl: './user-access-role-tag.html',
})
export class UserAccessRoleTag {
  role = input.required<Roles>();

  text = computed(() => {
    switch (this.role()) {
      case Roles.OWNER:
        return 'Owner';
      case Roles.ADMIN:
        return 'Admin';
      case Roles.OPERATOR:
        return 'Operator';
      case Roles.VIEWER:
        return 'Viewer';
      case Roles.TECHNICIAN:
        return 'Technician';
      case Roles.SECURITY_MONITOR:
        return 'Security Monitor';
      case Roles.SYSTEM_ADMIN:
        return 'System Admin';
      default:
        return 'Desconocido';
    }
  });

  severity = computed(() => {
    switch (this.role()) {
      case Roles.OWNER:
        return 'success';
      case Roles.ADMIN:
        return 'info';
      case Roles.OPERATOR:
        return 'warn';
      case Roles.VIEWER:
        return 'secondary';
      case Roles.TECHNICIAN:
        return 'contrast';
      case Roles.SECURITY_MONITOR:
        return 'danger';
      case Roles.SYSTEM_ADMIN:
        return 'warn';
      default:
        return 'secondary';
    }
  });
}
