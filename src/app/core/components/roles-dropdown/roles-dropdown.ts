import { Component, computed, inject, input, OnInit, output, signal } from '@angular/core';
import { Dropdown } from "@shared/components/dropdown/dropdown";
import { ReactiveFormsModule } from "@angular/forms";
import { HostControl } from '@shared/directives/host-control';
import { ControlAccessor } from '@shared/abstractions/control-accessor';
import { RolesService } from '@core/services/roles.service';
import { DropdownOption } from '@shared/abstractions/dropdown/dropdown-option';
import { RoleDto } from '@core/domain/dtos/role.dto';

@Component({
  selector: 'hta-roles-dropdown',
  imports: [ReactiveFormsModule, Dropdown],
  templateUrl: './roles-dropdown.html',
  styleUrl: './roles-dropdown.css',
  hostDirectives: [HostControl]
})
export class RolesDropdown implements OnInit {
  setByName = input<string>('');
  allowClear = input<boolean>(true);

  #hostControl = inject<ControlAccessor<string>>(HostControl);
  #roleService = inject(RolesService);

  control = this.#hostControl.control;
  options = signal<DropdownOption[]>([]);

  changes = output<DropdownOption>();
  clear = output<void>();

  ngOnInit(): void {
    if (!this.options().length) {
      this.#roleService.getAllRoles().subscribe((roles) => {
        this.options.set(roles.map((role) => ({
          value: role.id,
          label: role.name
        })))

        this.#init();
      });
    } else {
      this.#init();
    }
  }

  #init(): void {
    if (this.setByName()) {
      const role = this.options().find((role) => role.label === this.setByName());
      if (role) {
        this.#hostControl.setValue(role.value);
      }
    }

    this.#hostControl.control().valueChanges.subscribe((selectedRoleValue: string) => {
      const role = this.options().find((role) => role.value === selectedRoleValue);
      if (role) {
        this.changes.emit(role);
      } else {
        this.clear.emit();
      }
    })
  }
}
