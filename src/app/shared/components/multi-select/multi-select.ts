import { Component, computed, inject, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DropdownOption } from '@shared/abstractions/dropdown/dropdown-option';
import { HostControl } from '@shared/directives/host-control';
import { Message } from 'primeng/message';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'hta-multi-select',
  imports: [ReactiveFormsModule, MultiSelectModule, Message],
  templateUrl: './multi-select.html',
  styleUrl: './multi-select.css',
  hostDirectives: [HostControl],
})
export class MultiSelect {
  options = input.required<DropdownOption[]>();
  placeholder = input.required<string>();
  labelOption = input<string>('label');
  labelValue = input<string>('value');
  id = input.required<string>();
  filter = input<boolean>(false);
  showToggleAll = input<boolean>(false);

  control = inject(HostControl);

  hasError = computed(() => {
    return this.control.control().invalid && this.control.control().touched;
  });
}
