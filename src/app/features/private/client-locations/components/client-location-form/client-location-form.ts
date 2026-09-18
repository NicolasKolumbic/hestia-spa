import { Component, inject, input, OnInit, signal } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { SiteTypeDropdownComponent } from "@core/components/site-type-dropdown/site-type-dropdown.component";
import { Site } from "@core/domain/models/site";
import { SpaceService } from "@core/index";
import { FloatLabelInput } from "@shared/components/float-label-input/float-label-input";
import { RenderMap } from "@shared/directives/render-map";
import { Button as ngButton } from 'primeng/button';
import { SectionWrapper } from "@shared/components/section-wrapper/section-wrapper";
import { Button } from "@shared/components/button/button";
import { Router } from "@angular/router";

@Component({
    selector: 'hta-client-location-form',
    templateUrl: './client-location-form.html',
    imports: [
        RenderMap,
        ReactiveFormsModule,
        FloatLabelInput,
        ngButton,
        SiteTypeDropdownComponent,
        SectionWrapper,
        Button
    ]
})
export class ClientLocationForm implements OnInit {
    id = input<string>();

    #formBuilder = inject(FormBuilder);
    #spaceService = inject(SpaceService);
    #router = inject(Router);

    site = signal<Site | null>(null);

    siteForm: FormGroup = this.#formBuilder.group({
        name: ['', Validators.required],
        type: ['', Validators.required],
        status: ['ACTIVE', Validators.required],
        addressLine: ['', Validators.required],
        city: ['', Validators.required],
        province: ['', Validators.required],
        latitude: ['', Validators.required],
        longitude: ['', Validators.required],
        postalCode: ['', Validators.required]
    });

    ngOnInit(): void {
        if (this.id()) {
            this.#spaceService.findById(this.id()!).subscribe((site) => {
                if (site) {
                    this.site.set(site);
                    this.siteForm.patchValue({
                        name: site.name,
                        type: site.type,
                        status: site.status,
                        addressLine: site.addressLine,
                        city: site.city,
                        province: site.province,
                        latitude: site.latitude,
                        longitude: site.longitude,
                        postalCode: site.postalCode
                    });
                }
            });
        }
    }

    saveSite(): void {
        if (this.siteForm.valid) {
            const siteDto = this.siteForm.value;
            if (this.id()) {
                this.#spaceService.update({
                    id: this.id()!,
                    countryCode: 'AR',
                    timezone: 'America/Argentina/Cordoba',
                    locale: 'es-AR',
                    ...siteDto
                }).subscribe(() => {
                    this.site.set(siteDto);
                });
            } else {
                this.#spaceService.create({
                    countryCode: 'AR',
                    timezone: 'America/Argentina/Cordoba',
                    locale: 'es-AR',
                    ...siteDto
                }).subscribe((newSite) => {
                    this.site.set(newSite);
                });
            }
        }
    }

    onLocationChange({ lat, lng }: { lat: number; lng: number }): void {
        this.siteForm.patchValue({
            latitude: lat,
            longitude: lng,
        });
        this.siteForm.get('latitude')?.markAsDirty();
        this.siteForm.get('longitude')?.markAsDirty();
    }

    cancel(): void {
        this.#router.navigate(['/platform/client-locations-list']);
    }
}