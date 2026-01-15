import { Component, forwardRef, inject, input, OnInit } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, NgControl, SelectControlValueAccessor } from '@angular/forms';
import { DropdownOption } from '@shared/abstractions/dropdown/dropdown-option';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'hta-dropdown',
  imports: [FormsModule, SelectModule],
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Dropdown),
      multi: true
    }
  ]
})
export class Dropdown extends SelectControlValueAccessor implements OnInit {
  options = input.required<DropdownOption[]>();
  placeholder = input.required<string>();
  labelOption = input<string>('label');
  labelValue = input<string>('value');

  //control = inject(NgControl, { optional: true, self: true });

  ngOnInit(): void {
    //console.log(this.control);
  }
}
