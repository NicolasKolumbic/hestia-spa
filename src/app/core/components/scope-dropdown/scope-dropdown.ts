import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ControlAccessor } from '@shared/abstractions/control-accessor';
import { DropdownOption } from '@shared/abstractions/dropdown/dropdown-option';
import { Dropdown } from '@shared/components/dropdown/dropdown';
import { HostControl } from '@shared/directives/host-control';

@Component({
  selector: 'hta-scope-dropdown',
  imports: [ReactiveFormsModule, HostControl, Dropdown],
  templateUrl: './scope-dropdown.html',
  styleUrl: './scope-dropdown.css',
  hostDirectives: [HostControl]
})
export class ScopeDropdown {
  #hostControl = inject<ControlAccessor<string>>(HostControl);

  control = this.#hostControl.control();

  options: DropdownOption[] = [
    {
      label: 'Cliente',
      value: 'cliente'
    },
    {
      label: 'Sitio',
      value: 'sitio'
    },
    {
      label: 'Zona',
      value: 'zona'
    },
    {
      label: 'Dispositivo',
      value: 'dispositivo'
    }
  ]
}
