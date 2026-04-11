import { Component, inject, input, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ControlAccessor } from '@shared/abstractions/control-accessor';
import { DropdownOption } from '@shared/abstractions/dropdown/dropdown-option';
import { Dropdown } from '@shared/components/dropdown/dropdown';
import { HostControl } from '@shared/directives/host-control';

@Component({
  selector: 'hta-client-type-dropdown',
  imports: [ReactiveFormsModule, HostControl, Dropdown],
  templateUrl: './client-type-dropdown.html',
  styleUrl: './client-type-dropdown.css',
  hostDirectives: [HostControl]
})
export class ClientTypeDropdown implements OnInit {

  setByName = input<string>('');

  #hostControl = inject<ControlAccessor<string>>(HostControl);

  control = this.#hostControl.control;

  options: DropdownOption[] = [
    {
      label: 'Individual',
      value: 'individual'
    },
    {
      label: 'Empresa',
      value: 'business'
    },
    {
      label: 'Corporación',
      value: 'enterprise'
    },
    {
      label: 'Contrucción',
      value: 'construction'
    },
    {
      label: 'Administración de Propiedades',
      value: 'property_management'
    },
    {
      label: 'Institución',
      value: 'institution'
    }
  ];

  ngOnInit(): void {
    if (this.setByName()) {
      const clientType = this.options.find((role) => role.label === this.setByName());
      if (clientType) {
        this.#hostControl.setValue(clientType.value);
      }
    }
  }
}
