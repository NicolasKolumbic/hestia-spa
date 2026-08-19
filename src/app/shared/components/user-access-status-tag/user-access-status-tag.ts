import { Component, computed, input } from '@angular/core';
import { UserAccessStatus } from '@shared/enums/user-access-status.enum';
import { Tag } from "primeng/tag";

@Component({
  selector: 'hta-user-access-status-tag',
  imports: [Tag],
  templateUrl: './user-access-status-tag.html',
})
export class UserAccessScopeTag {
  status = input.required<string>();

  text = computed(() => {
    switch (this.status()) {
      case UserAccessStatus.ACTIVE:
        return 'Activo';
      case UserAccessStatus.INACTIVE:
        return 'Inactivo';
      case UserAccessStatus.PENDING:
        return 'Pendiente';
      case UserAccessStatus.REVOKED:
        return 'Revocado';
      default:
        return 'Desconocido';
    }
  });

  severity = computed(() => {
    switch (this.status()) {
      case UserAccessStatus.ACTIVE:
        return 'success';
      case UserAccessStatus.INACTIVE:
        return 'secondary';
      case UserAccessStatus.PENDING:
        return 'warn';
      case UserAccessStatus.REVOKED:
        return 'danger';
      default:
        return 'secondary';
    }
  });
}
