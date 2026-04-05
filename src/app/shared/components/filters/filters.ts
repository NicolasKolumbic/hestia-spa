import { Component, inject, input, OnInit, output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Filter } from './interfaces/filter.interface';
import { ButtonModule } from 'primeng/button';
import { MultiSelect } from "../multi-select/multi-select";
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'hta-filters',
  imports: [ButtonModule, MultiSelect, AsyncPipe],
  templateUrl: './filters.html',
  styleUrl: './filters.css',
})
export class Filters implements OnInit {
  description = input.required<string>();
  filters = input.required<Filter[]>();

  update = output<Record<string, unknown>>();

  #formBuilder = inject(FormBuilder);

  filterForm!: FormGroup;

  ngOnInit(): void {
    const formControls = this.filters().map((filter) => ({ [filter.label]: [(filter.defaultValue ?? null)] }));
    this.filterForm = this.#formBuilder.group(formControls);

    this.filterForm.valueChanges.subscribe(() => {
      this.update.emit(this.filterForm.value);
    });
  }

  clearFilters(): void {
    this.filterForm.reset();
  }

}
