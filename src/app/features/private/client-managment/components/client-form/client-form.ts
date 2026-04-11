import { Component, inject, input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ClientTypeDropdown } from '@core/components/client-type-dropdown/client-type-dropdown';
import { DrawerBody } from '@shared/components/drawer/interfaces/drawer-body';
import { DrawerRef } from '@shared/components/drawer/interfaces/drawer-ref';
import { FloatLabelInput } from '@shared/components/float-label-input/float-label-input';
import { ClientDto } from '../../interfaces/client.dto';
import { ExtendedClient } from '@core/domain/models/extended-client';

@Component({
  selector: 'hta-client-form',
  imports: [ReactiveFormsModule, FloatLabelInput, ClientTypeDropdown],
  templateUrl: './client-form.html',
  styleUrl: './client-form.css',
})
export class ClientForm implements OnInit, DrawerBody {
  drawerRef = input.required<DrawerRef>();
  client = input<ExtendedClient>();
  clientForm: FormGroup;

  #formBuilder = inject(FormBuilder);

  constructor() {
    this.clientForm = this.#formBuilder.group({
      clientId: [undefined],
      name: ['', Validators.required],
      cuit: ['', Validators.required],
      type: ['', Validators.required],
    })
  }

  ngOnInit(): void {
    if (this.client()) {
      this.clientForm.patchValue(this.client()!);
    }

    this.drawerRef().getData(() => this.clientForm.value);
  }
}
