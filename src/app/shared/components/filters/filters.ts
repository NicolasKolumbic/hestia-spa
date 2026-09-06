import { Component, DestroyRef, inject, input, OnInit, output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Filter } from './interfaces/filter.interface';
import { ButtonModule } from 'primeng/button';
import { MultiSelect } from "../multi-select/multi-select";
import { Dropdown } from "../dropdown/dropdown";
import { FloatLabelInput } from "../float-label-input/float-label-input";
import { AsyncPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'hta-filters',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    MultiSelect,
    Dropdown,
    FloatLabelInput,
    AsyncPipe
  ],
  templateUrl: './filters.html',
  styleUrl: './filters.css',
})
export class Filters implements OnInit {
  description = input.required<string>();
  filters = input.required<Filter[]>();

  update = output<Record<string, unknown>>();

  #formBuilder = inject(FormBuilder);
  #destroyRef = inject(DestroyRef);

  filterForm!: FormGroup;

  ngOnInit(): void {
    this.#buildForm();
  }

  getControlName(filter: Filter): string {
    return filter.name ?? filter.label;
  }

  clearFilters(): void {
    const defaultValues: Record<string, unknown> = {};
    for (const filter of this.filters()) {
      const key = this.getControlName(filter);
      defaultValues[key] = filter.defaultValue !== undefined
        ? filter.defaultValue
        : (filter.type === 'multi-select' ? [] : null);
    }
    this.filterForm.reset(defaultValues);
  }

  #buildForm(): void {
    const group: Record<string, FormControl> = {};

    for (const filter of this.filters()) {
      const key = this.getControlName(filter);
      const initialValue = filter.defaultValue !== undefined
        ? filter.defaultValue
        : (filter.type === 'multi-select' ? [] : null);

      group[key] = new FormControl(initialValue);
    }

    this.filterForm = this.#formBuilder.group(group);

    this.filterForm.valueChanges
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((values) => {
        this.update.emit(values);
      });
  }
}

