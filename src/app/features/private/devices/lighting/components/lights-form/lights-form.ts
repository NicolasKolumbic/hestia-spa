import { Component, inject, input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Device } from '@core/domain/models/device';
import { SpaceService } from '@core/index';
import { DialogContent } from '@shared/abstractions/dialog/dialog-content';
import { DeviceTypeDropdown } from '@shared/bussiness/device-type-dropdown/device-type-dropdown';
import { ZoneDropdown } from '@shared/bussiness/zone-dropdown/zone-dropdown';
import { FloatLabelInput } from "@shared/components/float-label-input/float-label-input";

@Component({
  selector: 'hta-lights-form',
  imports: [FloatLabelInput, ReactiveFormsModule, ZoneDropdown, DeviceTypeDropdown],
  templateUrl: './lights-form.html',
  styleUrl: './lights-form.css',
})
export class LightsForm implements DialogContent, OnInit {
  light = input.required<Device | null>();
  lightForm: FormGroup;

  #formBuilder = inject(FormBuilder);
  #spaceService = inject(SpaceService);


  constructor() {
    this.lightForm = this.#formBuilder.group({
      name: ['', Validators.required],
      manufacturer: ['', Validators.required],
      model: ['', Validators.required],
      siteId: ['', Validators.required],
      zoneId: ['', Validators.required],
      deviceTypeId: ['', Validators.required]
    })

    this.#spaceService.selectedSite$.pipe(takeUntilDestroyed()).subscribe(site => {
      this.lightForm.get('siteId')?.setValue(site?.siteId);
    });
  }

  ngOnInit(): void {
    if (this.light()) {
      this.lightForm.patchValue(this.light()!);
    }
  }

  getForm(): FormGroup {
    return this.lightForm;
  }
  isInvalid(): boolean {
    return this.lightForm.invalid;
  }

  getData<T>(): T {
    return this.lightForm.value as T;
  }
}
