import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogContent } from '@shared/abstractions/dialog/dialog-content';
import { FloatLabelInput } from '@shared/components/float-label-input/float-label-input';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SpaceService, Zone } from 'src/app/core';
import { IconSelector } from "@shared/components/icon-selector/icon-selector";
import { zoneIcons } from '@shared/bussiness/statics/zones-icons';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';


@Component({
  selector: 'hta-space-detail',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, InputTextModule, SelectModule, FloatLabelInput, IconSelector],
  templateUrl: './space-detail.html',
  styleUrl: './space-detail.css',
})
export class SpaceDetail implements DialogContent, OnInit {
  space = input.required<Zone | null>();
  spaceForm: FormGroup;
  #formBuilder = inject(FormBuilder);
  #spaceService = inject(SpaceService);

  icons = zoneIcons;

  constructor() {
    this.spaceForm = this.#formBuilder.group({
      name: ['', Validators.required],
      icon: ['', Validators.required],
      siteId: [null, Validators.required],
      zoneId: [null],
    });

    this.#spaceService.selectedSite$.pipe(takeUntilDestroyed()).subscribe(site => {
      this.spaceForm.get('siteId')?.setValue(site?.siteId);
    });
  }

  ngOnInit(): void {
    if (this.space()) {
      this.spaceForm.patchValue(this.space()!);
    }
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

}
