import { Component, inject, input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SiteTypeDropdownComponent } from '@core/components/site-type-dropdown/site-type-dropdown.component';
import { Site } from '@core/domain/models/site';
import { DrawerBody } from '@shared/components/drawer/interfaces/drawer-body';
import { DrawerRef } from '@shared/components/drawer/interfaces/drawer-ref';
import { FloatLabelInput } from '@shared/components/float-label-input/float-label-input';

@Component({
    selector: 'hta-site-location',
    templateUrl: './site-location.component.html',
    styleUrl: './site-location.component.css',
    imports: [
        ReactiveFormsModule,
        FloatLabelInput,
        SiteTypeDropdownComponent
    ]
})
export class SiteLocationComponent implements OnInit, DrawerBody {
    site = input<Site>();
    drawerRef = input.required<DrawerRef>();

    #formBuilder = inject(FormBuilder);

    siteForm: FormGroup = this.#formBuilder.group({
        name: [this.site()?.name ?? '', Validators.required],
        type: [this.site()?.type ?? '', Validators.required],
        status: [this.site()?.status ?? '', Validators.required],
        addressLine: [this.site()?.address ?? '', Validators.required],
        city: [this.site()?.city ?? '', Validators.required],
        countryCode: [this.site()?.countryCode ?? '', Validators.required],
        locale: [this.site()?.locale ?? '', Validators.required],
        province: [this.site()?.province ?? '', Validators.required],
        latitude: [this.site()?.latitude ?? '', Validators.required],
        longitude: [this.site()?.longitude ?? '', Validators.required],
        postalCode: [this.site()?.postalCode ?? '', Validators.required]
    });

    ngOnInit(): void {
        if (this.site()) {
            this.siteForm.patchValue({
                ...this.site(),
                addressLine: this.site()?.address
            });
        }

        this.drawerRef().getData(() => this.siteForm.value);
    }

}