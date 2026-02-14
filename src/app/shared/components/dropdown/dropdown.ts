import { Component, computed, inject, input, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DropdownOption } from '@shared/abstractions/dropdown/dropdown-option';
import { SelectModule } from 'primeng/select';
import { FloatLabel } from "primeng/floatlabel";
import { HostControl } from '@shared/directives/host-control';
import { Message } from "primeng/message";

@Component({
  selector: 'hta-dropdown',
  imports: [ReactiveFormsModule, SelectModule, FloatLabel, Message],
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.css',
  hostDirectives: [HostControl],
})
export class Dropdown {
  options = input.required<DropdownOption[]>();
  placeholder = input.required<string>();
  labelOption = input<string>('label');
  labelValue = input<string>('value');
  id = input.required<string>();

  control = inject(HostControl);

  hasError = computed(() => {
    return this.control.control().invalid && this.control.control().touched;
  });

}
