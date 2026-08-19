import { Component, input, computed } from '@angular/core';
import { UserStatusEnum } from '@shared/enums/user-status.enum';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'hta-user-status-tag',
  imports: [Tag],
  templateUrl: './user-status-tag.html',
})
export class UserStatusTag {
  status = input.required<string>();

  text = computed(() => {
    switch (this.status()) {
      case UserStatusEnum.ACTIVE:
        return 'Activo';
      case UserStatusEnum.INACTIVE:
        return 'Inactivo';
      case UserStatusEnum.BLOCKED:
        return 'Bloqueado';
      default:
        return 'Desconocido';
    }
  });

  severity = computed(() => {
    switch (this.status()) {
      case UserStatusEnum.ACTIVE:
        return 'success';
      case UserStatusEnum.INACTIVE:
        return 'secondary';
      case UserStatusEnum.BLOCKED:
        return 'danger';
      default:
        return 'secondary';
    }
  });
}
