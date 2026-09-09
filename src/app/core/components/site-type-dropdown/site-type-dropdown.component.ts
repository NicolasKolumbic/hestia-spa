
import { Component, inject, input } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { ControlAccessor } from "@shared/abstractions/control-accessor";
import { DropdownOption } from "@shared/abstractions/dropdown/dropdown-option";
import { Dropdown } from "@shared/components/dropdown/dropdown";
import { HostControl } from "@shared/directives/host-control";

@Component({
    selector: 'hta-site-type-dropdown',
    templateUrl: './site-type-dropdown.component.html',
    styleUrl: './site-type-dropdown.component.css',
    imports: [ReactiveFormsModule, Dropdown],
    hostDirectives: [HostControl]
})
export class SiteTypeDropdownComponent {
    #hostControl = inject<ControlAccessor<string>>(HostControl);

    control = this.#hostControl.control;

    options: DropdownOption[] = [
        {
            label: 'Residential',
            value: 'RESIDENTIAL'
        },
        {
            label: 'Apartment',
            value: 'APARTMENT'
        },
        {
            label: 'Commercial',
            value: 'COMMERCIAL'
        },
        {
            label: 'Office',
            value: 'OFFICE'
        },
        {
            label: 'Industrial',
            value: 'INDUSTRIAL'
        },
        {
            label: 'Institutional',
            value: 'INSTITUTIONAL'
        },
        {
            label: 'Rural',
            value: 'RURAL'
        },
        {
            label: 'Other',
            value: 'OTHER'
        }
    ];
}