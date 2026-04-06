import { Component, computed, inject, OnInit, signal } from '@angular/core';
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
  #hostControl = inject<ControlAccessor<string>>(HostControl);
  #roleService = inject(RolesService);

  control = computed(() => this.#hostControl.control());
  options = signal<DropdownOption[]>([])

  ngOnInit(): void {
    this.#roleService.getAllRoles().subscribe((roles) => {
      this.options.set(roles.map((role) => ({
        value: role.id,
        label: role.name
      })))
    });
  }
}
