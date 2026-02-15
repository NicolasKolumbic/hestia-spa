import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogContent } from '@shared/abstractions/dialog/dialog-content';
import { Dropdown } from '@shared/components/dropdown/dropdown';
import { FloatLabelInput } from '@shared/components/float-label-input/float-label-input';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SpaceService, Zone } from 'src/app/core';
import { IconSelector } from "@shared/components/icon-selector/icon-selector";
import { zoneIcons } from '@shared/bussiness/statics/zones-icons';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';


@Component({
  selector: 'hta-space-detail',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, InputTextModule, Dropdown, SelectModule, FloatLabelInput, IconSelector],
  templateUrl: './space-detail.html',
  styleUrl: './space-detail.css',
})
export class SpaceDetail implements DialogContent {
  space = input.required<Zone | null>();
  spaceForm: FormGroup;
  #formBuilder = inject(FormBuilder);
  #spaceService = inject(SpaceService);

  icons = zoneIcons;

  effect() {
    if (this.space()) {
      this.spaceForm.patchValue(this.space()!);
    } else {
      this.spaceForm.reset();
    }
  }

  constructor() {
    this.spaceForm = this.#formBuilder.group({
      name: ['', Validators.required],
      icon: ['', Validators.required],
      type: ['', Validators.required],
      siteId: [null, Validators.required],
    });

    this.#spaceService.selectedSite$.pipe(takeUntilDestroyed()).subscribe(site => {
      this.spaceForm.get('siteId')?.setValue(site?.siteId);
    });
  }

  getForm(): FormGroup {
    return this.spaceForm;
  }
  isInvalid(): boolean {
    return this.spaceForm.invalid;
  }

  getData<T>(): T {
    return this.spaceForm.value as T;
  }

  spaceTypes = [
    { label: 'Sala de Estar', value: 'living' },
    { label: 'Dormitorio', value: 'bedroom' },
    { label: 'Cocina', value: 'kitchen' },
    { label: 'Baño', value: 'bathroom' },
    { label: 'Oficina', value: 'office' },
    { label: 'Exterior', value: 'outdoor' }
  ];
}
