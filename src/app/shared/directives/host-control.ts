import { Directive, forwardRef, inject, Injector, OnInit, signal } from '@angular/core';
import { ControlContainer, ControlValueAccessor, FormControl, FormControlDirective, FormControlName, FormGroup, NG_VALUE_ACCESSOR, NgControl, NgModel } from '@angular/forms';
import { OnChange } from '@shared/typings/onchange.type';
import { OnTouched } from '@shared/typings/onotuched.type';

@Directive({
  selector: '[htaHostControl]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => HostControl),
      multi: true
    }
  ]
})
export class HostControl<T> implements ControlValueAccessor, OnInit {

  control = signal<FormControl>(new FormControl());
  value = signal<T | null>(null);
  isDisabled = signal(false);

  onChange: OnChange<T> = () => { };
  onTouched: OnTouched = () => { };

  #injector = inject(Injector);

  constructor() { }

  ngOnInit() {
    const ngControl = this.#injector.get(NgControl, null, { self: true, optional: true });

    if (ngControl instanceof NgModel) {
      this.control.set(ngControl.control);
      ngControl.control.valueChanges.subscribe((value) => {
        if (ngControl.model !== value || ngControl.viewModel !== value) {
          ngControl.viewToModelUpdate(value);
        }
      });

    } else if (ngControl instanceof FormControlDirective) {
      this.control.set(ngControl.control);
    } else if (ngControl instanceof FormControlName) {
      const container = this.#injector.get(ControlContainer).control as FormGroup;
      const name = ngControl.name ? ngControl.name.toString() : '';
      this.control.set(container.controls[name] as FormControl);

    }
  }

  writeValue(value: T): void {
    this.value.set(value);
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

}
