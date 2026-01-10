import { Component, Optional, Self, Input, input, OnInit } from '@angular/core';
import { FormControl, NgControl, ReactiveFormsModule } from '@angular/forms';

import { FloatLabelModule } from 'primeng/floatlabel';
import { MessageModule } from 'primeng/message';
import { BaseInput } from '../base-input/base-input';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'hta-float-label-input',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    MessageModule,
    FloatLabelModule
  ],
  templateUrl: './float-label-input.html',
  styleUrl: './float-label-input.css'
})
export class FloatLabelInput extends BaseInput implements OnInit {
  label = input.required<string>();
  id = input.required<string>();
  errorMessages = input<Record<string, string>>({});

  constructor(@Optional() @Self() public ngControl: NgControl) {
    super();
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }
  ngOnInit(): void {
    console.log(this.errorMessages());
  }

  get control() {
    return this.ngControl?.control as FormControl;
  }

  handleInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.updateValue(val);
  }
}
