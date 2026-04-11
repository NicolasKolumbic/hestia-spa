import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { Dropdown } from "@shared/components/dropdown/dropdown";
import { ReactiveFormsModule } from "@angular/forms";
import { HostControl } from '@shared/directives/host-control';
import { ControlAccessor } from '@shared/abstractions/control-accessor';
import { RolesService } from '@core/services/roles.service';
import { DropdownOption } from '@shared/abstractions/dropdown/dropdown-option';

@Component({
  selector: 'hta-roles-dropdown',
  imports: [ReactiveFormsModule, Dropdown],
  templateUrl: './roles-dropdown.html',
  styleUrl: './roles-dropdown.css',
  hostDirectives: [HostControl]
})
export class RolesDropdown implements OnInit {
  setByName = input<string>('');

  #hostControl = inject<ControlAccessor<string>>(HostControl);
  #roleService = inject(RolesService);

  control = this.#hostControl.control;
  options = signal<DropdownOption[]>([])

  ngOnInit(): void {
    this.#roleService.getAllRoles().subscribe((roles) => {
      this.options.set(roles.map((role) => ({
        value: role.id,
        label: role.name
      })))

      if (this.setByName()) {
        const role = this.options().find((role) => role.label === this.setByName());
        if (role) {
          this.#hostControl.setValue(role.value);
        }
      }
    });
  }
}
