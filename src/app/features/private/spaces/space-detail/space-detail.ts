import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogContent } from '@shared/abstractions/dialog/dialog-content';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Zone } from 'src/app/core';


@Component({
  selector: 'hta-space-detail',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, InputTextModule, SelectModule],
  templateUrl: './space-detail.html',
  styleUrl: './space-detail.css',
})
export class SpaceDetail implements DialogContent {
  space = input.required<Zone | null>();
  spaceForm: FormGroup;
  #formBuilder = inject(FormBuilder);

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
      siteId: ['', Validators.required],
    });
  }

  getData<T>(): T {
    return this.spaceForm.value as T;
  }

  // DATOS AUXILIARES
  availableIcons = [
    'pi-home', 'pi-desktop', 'pi-wifi', 'pi-inbox',
    'pi-briefcase', 'pi-building', 'pi-car', 'pi-shopping-cart',
    'pi-heart', 'pi-star'
  ];

  spaceTypes = [
    { label: 'Sala de Estar', value: 'living' },
    { label: 'Dormitorio', value: 'bedroom' },
    { label: 'Cocina', value: 'kitchen' },
    { label: 'Baño', value: 'bathroom' },
    { label: 'Oficina', value: 'office' },
    { label: 'Exterior', value: 'outdoor' }
  ];
}
