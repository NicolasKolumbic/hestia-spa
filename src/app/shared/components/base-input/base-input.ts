import { Component, signal } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

@Component({
  template: '',
})
export class BaseInput implements ControlValueAccessor {
  value = signal<string>('');
  disabled = signal<boolean>(false);

  protected onTouched?() { }
  protected onChange?(_: unknown) { }

  writeValue(valueToWrite: string): void {
    this.value.set(valueToWrite);
  }
  registerOnChange(fn: (_: unknown) => unknown): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => unknown): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected updateValue(val: string) {
    if (this.onChange) {
      this.value.set(val);
      this.onChange(val);
    }
  }

  protected handleBlur() {
    if (this.onTouched) {
      this.onTouched();
    }
  }

}
