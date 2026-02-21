import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DeviceTypeService } from '@core/services/device-type.service';
import { DropdownOption } from '@shared/abstractions/dropdown/dropdown-option';
import { Dropdown } from '@shared/components/dropdown/dropdown';
import { HostControl } from '@shared/directives/host-control';
import { MessageService } from 'primeng/api';
import { catchError, map, of } from 'rxjs';

@Component({
  selector: 'hta-device-type-dropdown',
  imports: [ReactiveFormsModule, Dropdown],
  templateUrl: './device-type-dropdown.html',
  styleUrl: './device-type-dropdown.css',
  hostDirectives: [HostControl]
})
export class DeviceTypeDropdown implements OnInit {
  control = inject(HostControl);
  options = signal<DropdownOption[]>([]);

  #messageService = inject(MessageService);
  #deviceTypeService = inject(DeviceTypeService);

  ngOnInit(): void {
    this.#deviceTypeService.findAll()
      .pipe(
        catchError(() => {
          this.#messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la lista de espacios.' });
          return of([]);
        }),
        map(deviceTypes => deviceTypes.map(deviceType => ({ value: deviceType.deviceTypeId, label: deviceType.name })))
      )
      .subscribe(deviceTypesOptions => {
        this.options.set(deviceTypesOptions);
      });
  }

}
