import { Component, inject, input, OnInit } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { ControlAccessor } from "@shared/abstractions/control-accessor";
import { DropdownOption } from "@shared/abstractions/dropdown/dropdown-option";
import { Dropdown } from "@shared/components/dropdown/dropdown";
import { HostControl } from "@shared/directives/host-control";

@Component({
    selector: 'hta-user-status-dropdown',
    imports: [Dropdown, HostControl, ReactiveFormsModule],
    templateUrl: './user-status-dropdown.component.html',
    hostDirectives: [HostControl]
})
export class UserStatusDropdown {
    #hostControl = inject<ControlAccessor<string>>(HostControl);
    control = this.#hostControl.control;

    setByName = input<string>('');
    options = [
        { label: 'Activo', value: 'active' },
        { label: 'Pendiente', value: 'pending' },
        { label: 'Inactivo', value: 'inactive' },
        { label: 'Revocado', value: 'revoked' },
    ] satisfies DropdownOption[];
}