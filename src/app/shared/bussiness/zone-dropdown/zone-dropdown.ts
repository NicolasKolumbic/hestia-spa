import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HostControl } from '@shared/directives/host-control';
import { Dropdown } from '@shared/components/dropdown/dropdown';
import { Zone, ZoneService } from '@core/index';
import { MessageService } from 'primeng/api';
import { catchError, map, of } from 'rxjs';
import { DropdownOption } from '@shared/abstractions/dropdown/dropdown-option';

@Component({
  selector: 'hta-zone-dropdown',
  imports: [ReactiveFormsModule, Dropdown],
  templateUrl: './zone-dropdown.html',
  styleUrl: './zone-dropdown.css',
  hostDirectives: [HostControl]
})
export class ZoneDropdown implements OnInit {
  control = inject(HostControl);
  options = signal<DropdownOption[]>([]);

  #zoneService = inject(ZoneService);
  #messageService = inject(MessageService);

  ngOnInit(): void {
    this.#zoneService.getAllZones()
      .pipe(
        catchError(() => {
          this.#messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la lista de espacios.' });
          return of([]);
        }),
        map(zones => zones.map(zone => ({ value: zone.zoneId, label: zone.name })))
      )
      .subscribe(zones => {
        this.options.set(zones);
      });
  }

}
